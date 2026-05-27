import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEstimatedWaitTime } from "@/lib/ai/queue-prediction";

// GET /api/fila/publica?phone=5511999999999 — cliente consulta sua posição na fila
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ error: "Informe seu telefone." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      return NextResponse.json({ inQueue: false, message: "Número não cadastrado." });
    }

    const queueItem = await prisma.queueManager.findFirst({
      where: {
        customerId: customer.id,
        status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] }
      },
      include: { barber: true, service: true }
    });

    if (!queueItem) {
      return NextResponse.json({ inQueue: false, message: "Você não está na fila." });
    }

    // Conta pessoas na frente
    const peopleAhead = await prisma.queueManager.count({
      where: {
        orderIndex: { lt: queueItem.orderIndex },
        status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] }
      }
    });

    return NextResponse.json({
      inQueue: true,
      position: peopleAhead + 1,
      status: queueItem.status,
      estimatedWaitMins: queueItem.estimatedWaitMins,
      barber: queueItem.barber?.name || "A definir",
      service: queueItem.service?.name || "A definir",
      joinedAt: queueItem.joinedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/fila/publica — cliente entra na fila pelo celular
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, serviceId } = body;

    if (!phone) {
      return NextResponse.json({ error: "Informe seu telefone." }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      return NextResponse.json({ error: "Número não cadastrado. Cadastre-se na barbearia primeiro." }, { status: 404 });
    }

    if (customer.isBlocked) {
      return NextResponse.json({ error: "Seu acesso está bloqueado. Fale com o barbeiro." }, { status: 403 });
    }

    const tenant = await prisma.tenant.findFirst();
    if (tenant) {
      if (tenant.isQueuePaused) {
        return NextResponse.json({ error: "A fila está pausada no momento." }, { status: 400 });
      }

      // Verifica horário de funcionamento
      const now = new Date();
      const currentHour = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
      if (currentHour < tenant.queueOpenTime || currentHour > tenant.queueCloseTime) {
        return NextResponse.json({ error: `A fila funciona entre ${tenant.queueOpenTime} e ${tenant.queueCloseTime}.` }, { status: 400 });
      }

      // Verifica limite máximo
      const currentSize = await prisma.queueManager.count({
        where: { status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } }
      });
      if (currentSize >= tenant.queueMaxSize) {
        return NextResponse.json({ error: `A fila está cheia (máx. ${tenant.queueMaxSize} pessoas). Tente mais tarde.` }, { status: 400 });
      }
    }

    // Verifica se já está na fila
    const alreadyInQueue = await prisma.queueManager.findFirst({
      where: { customerId: customer.id, status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } }
    });
    if (alreadyInQueue) {
      return NextResponse.json({ error: "Você já está na fila." }, { status: 400 });
    }

    // Calcula posição e tempo estimado
    const lastItem = await prisma.queueManager.findFirst({
      where: { status: { in: ["WAITING", "CONFIRMED", "IN_TRANSIT", "NEXT", "IN_PROGRESS"] } },
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 1;
    const peopleAhead = await prisma.queueManager.count({ where: { status: "WAITING" } });
    const estimatedWaitMins = await calculateEstimatedWaitTime();

    const newItem = await prisma.queueManager.create({
      data: {
        customerId: customer.id,
        serviceId: serviceId || null,
        position: peopleAhead + 1,
        orderIndex: nextOrderIndex,
        estimatedWaitMins,
        status: "WAITING"
      },
      include: { customer: true, service: true }
    });

    // Notifica WhatsApp
    const botApiUrl = process.env.BOT_API_URL || "";
    if (botApiUrl && customer.phone) {
      fetch(`${botApiUrl}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customer.phone,
          message: `✅ *BarberPro* — Você entrou na fila!\n\n📍 Posição: *${peopleAhead + 1}ª*\n⏱️ Espera estimada: *${estimatedWaitMins} min*\n\nAvisaremos quando for sua vez!`
        })
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, position: peopleAhead + 1, estimatedWaitMins }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
