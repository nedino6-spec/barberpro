import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/fila/[id]/rating — cliente avalia após atendimento
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Nota inválida. Use de 1 a 5." }, { status: 400 });
    }

    const item = await prisma.queueManager.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Atendimento não encontrado." }, { status: 404 });
    }
    if (item.status !== "COMPLETED") {
      return NextResponse.json({ error: "Só é possível avaliar atendimentos concluídos." }, { status: 400 });
    }

    const updated = await prisma.queueManager.update({
      where: { id },
      data: { rating, ratingComment: comment || null }
    });

    return NextResponse.json({ success: true, rating: updated.rating });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
