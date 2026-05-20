import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        customer: true,
        barber: true,
        service: true,
      },
      orderBy: {
        date: 'asc',
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
        ]
      }
    });

    if (conflict) {
      return NextResponse.json({ error: 'Horário indisponível para este barbeiro' }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId: data.customerId,
        barberId: data.barberId,
        serviceId: data.serviceId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'CONFIRMED'
      },
      include: {
        customer: true,
        barber: true,
        service: true
      }
    });

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
