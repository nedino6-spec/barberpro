import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    
    await prisma.$transaction(async (tx) => {
      const customerFinance = await tx.customerFinance.findUnique({
        where: { customerId: params.id }
      });

      if (!customerFinance || customerFinance.debtBalance <= 0) {
        throw new Error("Cliente não possui dívidas.");
      }

      // 1. Lança no Finance como INCOME
      await tx.finance.create({
        data: {
          type: "INCOME",
          amount: customerFinance.debtBalance,
          description: `Quitação de Dívida (Fiado) - Cliente`,
          date: new Date(),
        }
      });

      // 2. Zera a dívida
      await tx.customerFinance.update({
        where: { customerId: params.id },
        data: { debtBalance: 0 }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao quitar dívida:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
