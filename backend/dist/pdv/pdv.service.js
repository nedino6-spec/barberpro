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
exports.PdvService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PdvService = class PdvService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkout(checkoutDto) {
        const { items, paymentMethod, totalAmount, customerId } = checkoutDto;
        try {
            await this.prisma.$transaction(async (tx) => {
                let customerFinance;
                let loyaltySystem;
                if (customerId) {
                    customerFinance = await tx.customerFinance.upsert({
                        where: { customerId },
                        update: {},
                        create: { customerId, debtBalance: 0, availableBalance: 0 },
                    });
                    loyaltySystem = await tx.loyaltySystem.upsert({
                        where: { customerId },
                        update: {},
                        create: { customerId, points: 0 },
                    });
                }
                if (paymentMethod === 'PENDENTE') {
                    if (!customerId)
                        throw new common_1.BadRequestException('É obrigatório selecionar um cliente para vender Fiado.');
                    await tx.customerFinance.update({
                        where: { customerId },
                        data: { debtBalance: customerFinance.debtBalance + totalAmount },
                    });
                }
                else {
                    await tx.finance.create({
                        data: {
                            type: 'INCOME',
                            amount: totalAmount,
                            description: `Venda PDV - ${items.length} item(s) (${paymentMethod})`,
                            date: new Date(),
                        },
                    });
                    if (customerId && customerFinance && customerFinance.debtBalance <= 0) {
                        const earnedPoints = Math.floor(totalAmount);
                        await tx.loyaltySystem.update({
                            where: { customerId },
                            data: { points: loyaltySystem.points + earnedPoints },
                        });
                    }
                }
                for (const item of items) {
                    if (item.type === 'product') {
                        const product = await tx.inventory.findUnique({
                            where: { id: item.id },
                        });
                        if (product && product.quantity > 0) {
                            await tx.inventory.update({
                                where: { id: item.id },
                                data: {
                                    quantity: product.quantity - item.cartQuantity,
                                },
                            });
                        }
                    }
                }
                for (const item of items) {
                    if (item.type === 'APPOINTMENT') {
                        await tx.appointment.update({
                            where: { id: item.id },
                            data: { status: 'COMPLETED' },
                        });
                    }
                }
            });
            return { message: 'Checkout finalizado com sucesso.' };
        }
        catch (error) {
            console.error('Erro no checkout PDV:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Erro interno ao processar venda');
        }
    }
};
exports.PdvService = PdvService;
exports.PdvService = PdvService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PdvService);
//# sourceMappingURL=pdv.service.js.map