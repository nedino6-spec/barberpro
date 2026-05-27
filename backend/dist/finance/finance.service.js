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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findTransactions(registerId) {
        return this.prisma.finance.findMany({
            where: registerId ? { cashRegisterId: registerId } : undefined,
            orderBy: { date: 'desc' },
            include: {
                barber: { select: { name: true } },
            },
            take: 50,
        });
    }
    async createTransaction(createTransactionDto) {
        const { type, amount, description, paymentMethod, status, barberId, barberCommission, cashRegisterId } = createTransactionDto;
        if (cashRegisterId) {
            const register = await this.prisma.cashRegister.findUnique({
                where: { id: cashRegisterId },
            });
            if (!register || register.status !== 'OPEN') {
                throw new common_1.BadRequestException('O caixa selecionado não está aberto.');
            }
        }
        const transaction = await this.prisma.finance.create({
            data: {
                type,
                amount,
                description,
                paymentMethod,
                status: status || 'PAID',
                date: new Date(),
                barberId: barberId || null,
                barberCommission: barberCommission || null,
                cashRegisterId: cashRegisterId || null,
            },
        });
        return { success: true, transaction };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map