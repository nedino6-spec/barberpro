import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "Data é obrigatória" }, { status: 400 });
    }

    // Busca agendamentos do dia específico
    const startOfDay = new Date(dateStr + "T00:00:00.000Z");
    const endOfDay = new Date(dateStr + "T23:59:59.999Z");

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        customer: true,
        service: true,
        barber: true,
      },
      orderBy: {
        startTime: 'asc',
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, barberId, serviceId, date, startTime, endTime } = data;

    if (!customerId || !barberId || !serviceId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date + "T12:00:00.000Z"),
        startTime,
        endTime,
        status: "PENDING",
        customer: { connect: { id: customerId } },
        barber: { connect: { id: barberId } },
        service: { connect: { id: serviceId } }
      },
      include: {
        customer: true,
        service: true,
        barber: true
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
