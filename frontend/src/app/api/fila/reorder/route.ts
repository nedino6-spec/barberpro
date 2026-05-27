import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Executar as atualizações em uma única transação garantindo integridade
    await prisma.$transaction(
      items.map((item: { id: string; orderIndex: number }) =>
        prisma.queueManager.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao reordenar fila:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
