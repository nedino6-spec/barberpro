import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { phone, name } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 });
    }

    // Verifica Configurações da Fila
    const tenant = await prisma.tenant.findFirst();
    if (tenant) {
      if (tenant.isQueuePaused) {
        return NextResponse.json({ error: "A fila virtual está pausada no momento. Tente novamente mais tarde." }, { status: 403 });
      }
      
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      if (currentHour < tenant.queueOpenTime || currentHour > tenant.queueCloseTime) {
        return NextResponse.json({ error: `A fila virtual funciona apenas entre ${tenant.queueOpenTime} e ${tenant.queueCloseTime}.` }, { status: 403 });
      }
    }

    // Achar ou criar cliente
    let customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: name || "Cliente do WhatsApp",
          phone
        }
      });
    }

    // Verificar se já tá na fila
    const existingQueue = await prisma.queueManager.findUnique({
      where: { customerId: customer.id }
    });

    if (existingQueue && existingQueue.status === "WAITING") {
      return NextResponse.json({ error: "Você já está na fila!" }, { status: 400 });
    }

    // Entrar na fila
    if (existingQueue) {
      await prisma.queueManager.update({
        where: { id: existingQueue.id },
        data: { status: "WAITING", createdAt: new Date() } // reinicia o tempo
      });
    } else {
      await prisma.queueManager.create({
        data: {
          customerId: customer.id,
          status: "WAITING",
        }
      });
    }

    // Retornar a posição
    const activeQueue = await prisma.queueManager.findMany({
      where: { status: "WAITING" },
      orderBy: { createdAt: 'asc' }
    });
    const position = activeQueue.findIndex(q => q.customerId === customer.id) + 1;

    return NextResponse.json({ success: true, position });
  } catch (error) {
    console.error("Error joining queue:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
