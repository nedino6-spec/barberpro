import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const queue = await prisma.queueManager.findMany({
      where: { 
        status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] }
      },
      include: { customer: true, barber: true },
      orderBy: { orderIndex: 'asc' }
    });
    return NextResponse.json(queue);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { customerId } = body;

    if (!customerId) {
      // Fallback para o primeiro cliente se for teste
      const firstCustomer = await prisma.customer.findFirst();
      if (firstCustomer) {
        customerId = firstCustomer.id;
      } else {
        return NextResponse.json({ error: "Cliente não informado" }, { status: 400 });
      }
    }

    const tenant = await prisma.tenant.findFirst();
    if (tenant) {
      if (tenant.isQueuePaused) {
        return NextResponse.json({ error: "A fila virtual está pausada." }, { status: 400 });
      }
      
      const now = new Date();
      // Converte a hora local corretamente (ajuste de fuso caso necessário)
      const currentHour = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
      
      if (currentHour < tenant.queueOpenTime || currentHour > tenant.queueCloseTime) {
        return NextResponse.json({ error: `A fila funciona apenas entre ${tenant.queueOpenTime} e ${tenant.queueCloseTime}.` }, { status: 400 });
      }
    }

    const peopleAhead = await prisma.queueManager.count({ where: { status: "WAITING" } });
    
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (customer?.isBlocked) {
      return NextResponse.json({ error: "Cliente bloqueado." }, { status: 400 });
    }
    
    // Verifica se já está na fila
    const alreadyInQueue = await prisma.queueManager.findFirst({
      where: { customerId, status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } }
    });

    if (alreadyInQueue) {
      return NextResponse.json({ error: "Cliente já está na fila." }, { status: 400 });
    }

    // Calcula o orderIndex correto
    const lastItem = await prisma.queueManager.findFirst({
      where: { status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } },
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 1;

    // Tempo estimado inteligente
    const avgServiceTime = 30; // 30 min por cliente padrão, idealmente virá do Barber
    const estimatedWaitMins = peopleAhead * avgServiceTime;

    const newItem = await prisma.queueManager.create({
      data: {
        customerId,
        position: peopleAhead + 1,
        orderIndex: nextOrderIndex,
        estimatedWaitMins,
        status: "WAITING"
      },
      include: { customer: true }
    });

    // Tentar notificar webhook (Bot do WhatsApp) - Opcional e Assíncrono
    fetch(`${process.env.WHATSAPP_API_URL || "http://localhost:3001"}/fila/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    }).catch(() => {});

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
