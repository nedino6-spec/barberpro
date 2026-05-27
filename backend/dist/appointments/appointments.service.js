"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AppointmentsService = class AppointmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(date) {
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
    async create(createAppointmentDto) {
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
            throw new common_1.ConflictException('Horário indisponível para este barbeiro');
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
        }
        catch (e) {
            console.error('Erro na comunicação com o Bot:', e);
        }
        return appointment;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map