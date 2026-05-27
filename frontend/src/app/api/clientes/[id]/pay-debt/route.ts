import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json().catch(() => ({}));
    const { amount, isAddingDebt } = body;
    
    await prisma.$transaction(async (tx) => {
      // Garantir que exista o registro
      let customerFinance = await tx.customerFinance.findUnique({
        where: { customerId: params.id }
      });

      if (!customerFinance) {
        customerFinance = await tx.customerFinance.create({
          data: {
            customerId: params.id,
            debtBalance: 0
          }
        });
      }

      if (isAddingDebt) {
        // Apenas incrementa a dívida
        if (!amount || amount <= 0) throw new Error("Valor inválido.");
        await tx.customerFinance.update({
          where: { customerId: params.id },
          data: { debtBalance: { increment: amount } }
        });
      } else {
        // Fluxo Original de Quitação
        if (customerFinance.debtBalance <= 0) {
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
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao quitar dívida:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
