import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { items, paymentMethod, totalAmount, customerId } = data;

    if (!items || !items.length || !paymentMethod || totalAmount === undefined) {
      return NextResponse.json({ error: "Dados incompletos para fechamento" }, { status: 400 });
    }

    // Usaremos transaction para garantir que se der erro em um, cancela tudo.
    await prisma.$transaction(async (tx) => {
      
      // 1. Lógica Financeira do Cliente (Fiado e Fidelidade)
      let customerFinance;
      let loyaltySystem;

      if (customerId) {
        customerFinance = await tx.customerFinance.upsert({
          where: { customerId },
          update: {},
          create: { customerId, debtBalance: 0, availableBalance: 0 }
        });
        loyaltySystem = await tx.loyaltySystem.upsert({
          where: { customerId },
          update: {},
          create: { customerId, points: 0 }
        });
      }

      if (paymentMethod === "PENDENTE") {
        if (!customerId) throw new Error("É obrigatório selecionar um cliente para vender Fiado.");
        
        // Venda Fiado: Aumenta a dívida do cliente
        await tx.customerFinance.update({
          where: { customerId },
          data: { debtBalance: customerFinance!.debtBalance + parseFloat(totalAmount) }
        });

        // NOTA: Não injetamos no Caixa (Finance) porque o dinheiro não entrou de fato.
      } else {
        // Venda Paga: Injetar o dinheiro no caixa (Tabela Finance)
        await tx.finance.create({
          data: {
            type: "INCOME",
            amount: parseFloat(totalAmount),
            description: `Venda PDV - ${items.length} item(s) (${paymentMethod})`,
            category: "VENDAS",
            date: new Date(),
          }
        });

        // Regra de Fidelidade: Só ganha pontos se NÃO tiver dívida (Fiado)
        if (customerId && customerFinance && customerFinance.debtBalance <= 0) {
          const earnedPoints = Math.floor(parseFloat(totalAmount)); // 1 Ponto a cada R$ 1
          await tx.loyaltySystem.update({
            where: { customerId },
            data: { points: loyaltySystem!.points + earnedPoints }
          });
        }
      }

      // 2. Dar baixa no estoque para produtos físicos
      for (const item of items) {
        if (item.type === "product") {
          // Busca o produto atual
          const product = await tx.inventory.findUnique({
            where: { id: item.id }
          });
          
          if (product && product.quantity > 0) {
            await tx.inventory.update({
              where: { id: item.id },
              data: {
                quantity: product.quantity - item.cartQuantity
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: "Venda concluída com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("Erro no checkout PDV:", error);
    return NextResponse.json({ error: "Erro interno ao processar venda" }, { status: 500 });
  }
}
