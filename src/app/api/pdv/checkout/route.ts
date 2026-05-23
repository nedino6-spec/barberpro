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
      
      // 1. Injetar o dinheiro no caixa (Tabela Finance)
      await tx.finance.create({
        data: {
          type: "INCOME",
          amount: parseFloat(totalAmount),
          description: `Venda PDV - ${items.length} item(s)`,
          category: "VENDAS",
          date: new Date(),
        }
      });

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

      // 3. TODO no futuro: Marcar fila como concluída, calcular comissão.
    });

    return NextResponse.json({ success: true, message: "Venda concluída com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("Erro no checkout PDV:", error);
    return NextResponse.json({ error: "Erro interno ao processar venda" }, { status: 500 });
  }
}
