import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hours = await prisma.businessHour.findMany({
      orderBy: { dayOfWeek: 'asc' }
    });
    
    // Se não existir, retornar array padrão
    if (hours.length === 0) {
      const defaultHours = Array.from({ length: 7 }).map((_, i) => ({
        dayOfWeek: i,
        isClosed: i === 0, // Domingo fechado por padrão
        openTime: "09:00",
        closeTime: "19:00",
        breakStart: "12:00",
        breakEnd: "13:00"
      }));
      return NextResponse.json(defaultHours);
    }
    
    return NextResponse.json(hours);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch business hours" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json(); // Espera um array com 7 dias
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Atualiza ou Cria cada dia usando transaction
    const operations = data.map((day: any) => 
      prisma.businessHour.upsert({
        where: { dayOfWeek: day.dayOfWeek },
        update: {
          isClosed: day.isClosed,
          openTime: day.openTime,
          closeTime: day.closeTime,
          breakStart: day.breakStart,
          breakEnd: day.breakEnd,
        },
        create: {
          dayOfWeek: day.dayOfWeek,
          isClosed: day.isClosed,
          openTime: day.openTime,
          closeTime: day.closeTime,
          breakStart: day.breakStart,
          breakEnd: day.breakEnd,
        }
      })
    );

    const savedHours = await prisma.$transaction(operations);

    return NextResponse.json(savedHours);
  } catch (error) {
    console.error("Error saving business hours:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
