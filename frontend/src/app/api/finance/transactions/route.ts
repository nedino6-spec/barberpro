import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get transactions for the current open register
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const registerId = searchParams.get("registerId");

  try {
    const transactions = await prisma.finance.findMany({
      where: registerId ? { cashRegisterId: registerId } : undefined,
      orderBy: { date: "desc" },
      include: {
        barber: { select: { name: true } },
      },
      take: 50,
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// Create a new transaction
export async function POST(req: Request) {
  try {
    const { type, amount, description, paymentMethod, status, barberId, barberCommission, cashRegisterId } = await req.json();

    if (!amount || !description || !type || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify if register is open if cashRegisterId is provided
    if (cashRegisterId) {
      const register = await prisma.cashRegister.findUnique({
        where: { id: cashRegisterId },
      });
      if (!register || register.status !== "OPEN") {
        return NextResponse.json({ error: "O caixa selecionado não está aberto." }, { status: 400 });
      }
    }

    const transaction = await prisma.finance.create({
      data: {
        type, // INCOME, EXPENSE
        amount: Number(amount),
        description,
        paymentMethod, // MONEY, PIX, CREDIT_CARD, DEBIT_CARD
        status: status || "PAID",
        date: new Date(),
        barberId: barberId || null,
        barberCommission: barberCommission ? Number(barberCommission) : null,
        cashRegisterId: cashRegisterId || null,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
