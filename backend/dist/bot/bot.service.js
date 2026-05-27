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
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = require("openai");
let BotService = class BotService {
    constructor(prisma) {
        this.prisma = prisma;
        if (process.env.OPENAI_API_KEY) {
            this.openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
        }
    }
    async getCustomerInfo(phone) {
        if (!phone)
            throw new common_1.BadRequestException('Telefone é obrigatório');
        const customer = await this.prisma.customer.findUnique({
            where: { phone },
            include: {
                loyalty: true,
                finance: true,
                queueItem: true,
            },
        });
        if (!customer)
            throw new common_1.NotFoundException('Cliente não encontrado');
        let queuePosition = 0;
        if (customer.queueItem) {
            const activeQueue = await this.prisma.queueManager.findMany({
                where: { status: 'WAITING' },
                orderBy: { createdAt: 'asc' },
            });
            const index = activeQueue.findIndex(q => q.customerId === customer.id);
            queuePosition = index >= 0 ? index + 1 : 0;
        }
        return {
            customer: {
                name: customer.name,
                points: customer.loyalty?.points || 0,
                vipLevel: customer.loyalty?.vipLevel || 'BRONZE',
                debtBalance: customer.finance?.debtBalance || 0,
                queuePosition: queuePosition > 0 ? queuePosition : null,
            },
        };
    }
    async joinQueue(queueDto) {
        const { phone, name } = queueDto;
        const tenant = await this.prisma.tenant.findFirst();
        if (tenant) {
            if (tenant.isQueuePaused) {
                throw new common_1.ForbiddenException('A fila virtual está pausada no momento. Tente novamente mais tarde.');
            }
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            if (currentHour < tenant.queueOpenTime || currentHour > tenant.queueCloseTime) {
                throw new common_1.ForbiddenException(`A fila virtual funciona apenas entre ${tenant.queueOpenTime} e ${tenant.queueCloseTime}.`);
            }
        }
        let customer = await this.prisma.customer.findUnique({ where: { phone } });
        if (!customer) {
            customer = await this.prisma.customer.create({
                data: {
                    name: name || 'Cliente do WhatsApp',
                    phone,
                },
            });
        }
        if (customer.isBlocked) {
            throw new common_1.ForbiddenException('Seu acesso está bloqueado. Por favor, entre em contato com a barbearia.');
        }
        const existingQueue = await this.prisma.queueManager.findUnique({
            where: { customerId: customer.id },
        });
        if (existingQueue && existingQueue.status === 'WAITING') {
            throw new common_1.BadRequestException('Você já está na fila!');
        }
        if (existingQueue) {
            await this.prisma.queueManager.update({
                where: { id: existingQueue.id },
                data: { status: 'WAITING', createdAt: new Date() },
            });
        }
        else {
            await this.prisma.queueManager.create({
                data: {
                    customerId: customer.id,
                    status: 'WAITING',
                },
            });
        }
        const activeQueue = await this.prisma.queueManager.findMany({
            where: { status: 'WAITING' },
            orderBy: { createdAt: 'asc' },
        });
        const position = activeQueue.findIndex(q => q.customerId === customer.id) + 1;
        return { success: true, position };
    }
    async saveReview(reviewDto) {
        const { phone, rating } = reviewDto;
        const customer = await this.prisma.customer.findUnique({ where: { phone } });
        if (!customer)
            throw new common_1.NotFoundException('Cliente não encontrado');
        await this.prisma.review.create({
            data: {
                rating,
                customerId: customer.id,
            },
        });
        return { success: true };
    }
    async processAiChat(aiChatDto) {
        const { phone, message } = aiChatDto;
        if (!this.openai) {
            return { reply: "Desculpe, a IA está temporariamente indisponível. Digite *menu* para ver nossas opções." };
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Você é o assistente virtual da BarberPro, uma barbearia premium. Seja sempre educado, amigável e focado em atendimento.
Catálogo:
- Corte Degradê: R$ 45,00
- Barba Terapia: R$ 35,00
- Corte + Barba: R$ 70,00
- Sobrancelha: R$ 15,00
Para agendar, peça que o cliente digite '2' no menu principal. Para fila virtual, '1'. Responda de forma concisa, sem formatação complexa.`,
                    },
                    { role: 'user', content: message },
                ],
                max_tokens: 150,
            });
            return { reply: response.choices[0].message.content };
        }
        catch (error) {
            console.error('Erro na IA:', error);
            throw new common_1.InternalServerErrorException('Erro interno na IA');
        }
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BotService);
//# sourceMappingURL=bot.service.js.map