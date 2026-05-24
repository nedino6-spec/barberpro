import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    
    let whereClause = {};
    
    if (dateStr) {
      // Filtrar apenas o dia selecionado (00:00:00 até 23:59:59)
      const startDate = new Date(`${dateStr}T00:00:00.000Z`);
      const endDate = new Date(`${dateStr}T23:59:59.999Z`);
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        }
      };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.customerId || !data.barberId || !data.serviceId || !data.date || !data.startTime || !data.endTime) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Check for conflicting appointments
    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId: data.barberId,
        date: new Date(data.date),
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          }
        ],
        status: {
          not: "CANCELLED"
        }
      }
    });

    if (conflict) {
      return NextResponse.json({ error: 'Horário indisponível para este barbeiro' }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        customerId: data.customerId,
        barberId: data.barberId,
        serviceId: data.serviceId,
        status: "PENDING",
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      }
    });

    // Enfileira o job para sincronizar com o Google Calendar
    try {
      const { enqueueSystemToGoogleJob } = require('@/lib/queue/google-sync');
      await enqueueSystemToGoogleJob(appointment.id, "CREATE");
    } catch (qErr) {
      console.error("Erro ao enfileirar job do Google:", qErr);
    }

    // Disparo de Mensagem no WhatsApp
    try {
      const message = `Olá, ${appointment.customer.name}! Seu agendamento na BarberPro está CONFIRMADO para o dia ${appointment.date.toLocaleDateString('pt-BR')} às ${appointment.startTime}. Serviço: ${appointment.service.name} com ${appointment.barber.name}. Te esperamos! ✂️`;
      
      await fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: appointment.customer.phone, message })
      });
    } catch (e) {
      console.error("Erro ao notificar WhatsApp interno:", e);
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
