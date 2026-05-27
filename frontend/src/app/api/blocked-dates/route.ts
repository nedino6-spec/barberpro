import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date"); // YYYY-MM-DD
    const month = searchParams.get("month"); // YYYY-MM

    if (date) {
      const blockedDate = await prisma.blockedDate.findFirst({
        where: { date }
      });
      return NextResponse.json(blockedDate || null);
    }

    if (month) {
      const blockedDates = await prisma.blockedDate.findMany({
        where: {
          date: {
            startsWith: month
          }
        }
      });
      return NextResponse.json(blockedDates);
    }

    // Retorna todos se não houver filtro
    const all = await prisma.blockedDate.findMany();
    return NextResponse.json(all);
  } catch (error) {
    console.error("Erro ao buscar datas bloqueadas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, reason, isHoliday } = body;

    if (!date) {
      return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
    }

    // Verifica se já está bloqueado
    const existing = await prisma.blockedDate.findFirst({
      where: { date }
    });

    if (existing) {
      // Atualiza o motivo
      const updated = await prisma.blockedDate.update({
        where: { id: existing.id },
        data: { reason, isHoliday: isHoliday || false }
      });
      return NextResponse.json(updated);
    }

    const blocked = await prisma.blockedDate.create({
      data: {
        date,
        reason,
        isHoliday: isHoliday || false,
      }
    });

    return NextResponse.json(blocked, { status: 201 });
  } catch (error) {
    console.error("Erro ao bloquear data:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
    }

    // Busca o ID primeiro
    const existing = await prisma.blockedDate.findFirst({
      where: { date }
    });

    if (existing) {
      await prisma.blockedDate.delete({
        where: { id: existing.id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar data:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
