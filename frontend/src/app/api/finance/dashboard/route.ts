import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all transactions for the month
    const monthlyTransactions = await prisma.finance.findMany({
      where: {
        date: { gte: firstDayOfMonth },
        status: "PAID",
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let paymentMethods = {
      MONEY: 0,
      PIX: 0,
      CREDIT_CARD: 0,
      DEBIT_CARD: 0,
    };

    monthlyTransactions.forEach((t) => {
      if (t.type === "INCOME") {
        totalIncome += t.amount;
        if (t.paymentMethod in paymentMethods) {
          paymentMethods[t.paymentMethod as keyof typeof paymentMethods] += t.amount;
        }
      } else {
        totalExpense += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance,
      paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
