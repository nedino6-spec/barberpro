import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        loyalty: true,
        finance: true,
        queueItem: true
      }
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado", notFound: true }, { status: 404 });
    }

    // Calcular posição na fila
    let queuePosition = 0;
    if (customer.queueItem) {
      // Conta quantos na fila têm ID menor (chegaram antes) ou pela ordem de chegada, mas como tem `position`, podemos apenas usar o `position` se for autoincremento.
      // Assumindo que position guarda o número real na fila, ou precisamos recalcular a fila ativa.
      // Vamos buscar todos na fila ativa e encontrar a posição real:
      const activeQueue = await prisma.queueManager.findMany({
        where: { status: "WAITING" },
        orderBy: { createdAt: 'asc' }
      });
      const index = activeQueue.findIndex(q => q.customerId === customer.id);
      queuePosition = index >= 0 ? index + 1 : 0;
    }

    return NextResponse.json({
      customer: {
        name: customer.name,
        points: customer.loyalty?.points || 0,
        vipLevel: customer.loyalty?.vipLevel || "BRONZE",
        debtBalance: customer.finance?.debtBalance || 0,
        queuePosition: queuePosition > 0 ? queuePosition : null
      }
    });

  } catch (error) {
    console.error("Error fetching bot customer data:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
