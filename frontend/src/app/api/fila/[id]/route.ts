import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, barberId, orderIndex } = body; 

    // Dados a serem atualizados
    let updateData: any = {};
    if (status) updateData.status = status;
    if (barberId !== undefined) updateData.barberId = barberId;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const updated = await prisma.queueManager.update({
      where: { id },
      data: updateData,
      include: { customer: true, barber: true }
    });

    const tenant = await prisma.tenant.findFirst();
    const botApiUrl = process.env.WHATSAPP_API_URL || "https://barberpro-whatsapp-bot.onrender.com";

    // Função auxiliar para enviar WhatsApp webhook
    const sendWhatsApp = (phone: string, template: string | null | undefined, defaultMsg: string) => {
      let message = template || defaultMsg;
      message = message.replace("{{name}}", updated.customer.name);
      if (updated.barber?.name) message = message.replace("{{barber}}", updated.barber.name);

      fetch(`${botApiUrl}/api/send-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message })
      }).catch(() => {});
    };

    // Trigger de mensagens baseados no novo Status
    if (status === "NEXT") {
      sendWhatsApp(
        updated.customer.phone, 
        tenant?.msgQueueNext, 
        `⏳ *Fila Virtual - BarberFlow*\nPrepare-se, *${updated.customer.name}*!\nVocê é o **próximo** da fila. Dirija-se à barbearia imediatamente! ✂️`
      );
    } else if (status === "IN_PROGRESS") {
      sendWhatsApp(
        updated.customer.phone, 
        tenant?.msgQueueStart, 
        `✂️ Olá *${updated.customer.name}*, seu atendimento começou agora.`
      );
    } else if (status === "ABSENT") {
      sendWhatsApp(
        updated.customer.phone, 
        tenant?.msgQueueAbsent, 
        `❌ Olá *${updated.customer.name}*, você foi marcado como AUSENTE na fila. O próximo cliente foi chamado.`
      );
    }

    // Lógica da pessoa na 3a posição (se alguém terminou, quem virou o 3o?)

    // Se completou, checamos quem é o 3º da fila atual para mandar alerta
    if (status === "COMPLETED" || status === "CANCELLED" || status === "ABSENT" || status === "IN_PROGRESS") {
      const activeQueue = await prisma.queueManager.findMany({
        where: { status: { in: ["WAITING", "CONFIRMED", "COMMUTING"] }, barberId: updated.barberId },
        orderBy: { orderIndex: 'asc' },
        include: { customer: true }
      });
      
      if (activeQueue.length >= 3) {
        const thirdPerson = activeQueue[2];
        sendWhatsApp(
          thirdPerson.customer.phone, 
          tenant?.msgQueue3Left, 
          `⏳ *Fila Virtual - BarberFlow*\nFique atento, *${thirdPerson.customer.name}*!\nFaltam apenas *3 pessoas* na sua frente. Comece a se preparar! ✂️`
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.queueManager.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
