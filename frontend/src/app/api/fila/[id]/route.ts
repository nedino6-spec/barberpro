import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, barberId } = body; 

    let updateData: any = { status };
    if (status === "IN_PROGRESS") {
      updateData.startedAt = new Date();
    } else if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }
    
    if (barberId !== undefined) {
      updateData.barberId = barberId;
    }

    const updated = await prisma.queueManager.update({
      where: { id },
      data: updateData,
      include: { customer: true }
    });

    // Auto-bloquear cliente se tiver 3+ faltas
    if (status === "ABSENT" && updated.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: updated.customerId } });
      if (customer) {
        const newAbsentCount = (customer.absentCount || 0) + 1;
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            absentCount: newAbsentCount,
            isBlocked: newAbsentCount >= 3 // Auto-bloqueia na 3ª falta
          }
        });
      }
    }


    // Automação de WhatsApp Avançada (Evolution / Cloud API)
    try {
      const botApiUrl = process.env.BOT_API_URL || process.env.WHATSAPP_API_URL || "https://barberpro-whatsapp-bot.onrender.com";
      const queueItem = await prisma.queueManager.findUnique({
        where: { id },
        include: { customer: true, barber: true, tenant: true }
      });

      if (queueItem && queueItem.customer?.phone) {
        let msgType = "";
        let defaultText = "";

        if (status === "NEXT") {
          msgType = "NEXT";
          defaultText = `⏳ *Fila Virtual - BarberPro*\nOlá *${queueItem.customer.name}*!\nVocê é o *próximo* da fila. Por favor, se aproxime do barbeiro ${queueItem.barber?.name || ''} ✂️`;
        } else if (status === "IN_PROGRESS") {
          msgType = "IN_PROGRESS";
          defaultText = `✂️ *Fila Virtual - BarberPro*\nSeu atendimento começou agora, *${queueItem.customer.name}*!`;
        } else if (status === "ABSENT") {
          msgType = "ABSENT";
          defaultText = `⚠️ *Aviso BarberPro*\n*${queueItem.customer.name}*, você não estava presente quando foi chamado. Sua posição na fila foi removida.`;
        } else if (status === "COMPLETED") {
          // Enviar link de avaliação
          defaultText = `⭐ *BarberPro — Avalie seu atendimento!*\nObrigado pela visita, *${queueItem.customer.name}*!\n\nDê uma nota para o atendimento de hoje (responda com 1 a 5 estrelas):\n1⭐ Ruim | 2⭐ Regular | 3⭐ Bom | 4⭐ Ótimo | 5⭐ Excelente`;
          msgType = "COMPLETED";
        }

        if (msgType) {
          let finalMessage = defaultText;
          const template = await prisma.whatsAppTemplate.findFirst({
            where: { type: msgType, isActive: true }
          });
          if (template) {
            finalMessage = template.message
              .replace("{{nome}}", queueItem.customer.name)
              .replace("{{barbeiro}}", queueItem.barber?.name || "seu barbeiro");
          }

          fetch(`${botApiUrl}/api/send-message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: queueItem.customer.phone, message: finalMessage })
          }).catch(() => {});
        }

        // Notificar a 2ª pessoa na fila quando alguém é chamado como NEXT
        if (status === "NEXT") {
          const secondInQueue = await prisma.queueManager.findMany({
            where: { status: "WAITING" },
            orderBy: { orderIndex: "asc" },
            take: 2,
            include: { customer: true }
          });
          const secondPerson = secondInQueue.find(q => q.id !== id);
          if (secondPerson?.customer?.phone) {
            fetch(`${botApiUrl}/api/send-message`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone: secondPerson.customer.phone,
                message: `⚡ *BarberPro — Prepare-se!*\nOlá *${secondPerson.customer.name}*!\nVocê é o *2º da fila*. Falta pouco, se aproxime da barbearia! ✂️`
              })
            }).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.error("Erro ao notificar whatsapp", e);
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
