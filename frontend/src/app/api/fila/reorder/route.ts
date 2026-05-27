import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; 
    // items deve ser um array de { id: string, orderIndex: number, barberId?: string }

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "O payload deve conter um array 'items'." }, { status: 400 });
    }

    // Executar update em lote (transação)
    const updates = items.map((item) => {
      let dataToUpdate: any = { orderIndex: item.orderIndex };
      if (item.barberId !== undefined) {
        dataToUpdate.barberId = item.barberId;
      }
      return prisma.queueManager.update({
        where: { id: item.id },
        data: dataToUpdate
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, updated: items.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
