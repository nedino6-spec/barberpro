import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findAll(date?: string) {
    let whereClause = {};

    if (date) {
      const startDate = new Date(`${date}T00:00:00.000Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    return this.prisma.appointment.findMany({
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
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { customerId, barberId, serviceId, date, startTime, endTime } = createAppointmentDto;
    const appointmentDate = new Date(date);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        barberId,
        date: appointmentDate,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (conflict) {
      throw new ConflictException('Horário indisponível para este barbeiro');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        date: appointmentDate,
        startTime,
        endTime,
        customerId,
        barberId,
        serviceId,
        status: 'PENDING',
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    });

    // Google Sync desativado localmente para evitar spam no console

    try {
      const botUrl = process.env.BOT_API_URL || 'http://localhost:3001';
      const message = `Olá, ${appointment.customer.name}! Seu agendamento na BarberPro está CONFIRMADO para o dia ${appointment.date.toLocaleDateString('pt-BR')} às ${appointment.startTime}. Serviço: ${appointment.service.name} com ${appointment.barber.name}. Te esperamos! ✂️`;

      fetch(`${botUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: appointment.customer.phone, message }),
      }).catch(e => console.error('Falha ao enviar msg bot', e));

      fetch(`${botUrl}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'NOVO_AGENDAMENTO', data: { appointment } }),
      }).catch(e => console.error('Falha no broadcast WS', e));
    } catch (e) {
      console.error('Erro na comunicação com o Bot:', e);
    }

    return appointment;
  }
}
