import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class PdvService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async checkout(checkoutDto: CheckoutDto) {
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
          if (!customerId) throw new BadRequestException('É obrigatório selecionar um cliente para vender Fiado.');

          await tx.customerFinance.update({
            where: { customerId },
            data: { debtBalance: customerFinance!.debtBalance + totalAmount },
          });
        } else {
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
              data: { points: loyaltySystem!.points + earnedPoints },
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

            // Sync Google disabled local
          }
        }
      });

      return { message: 'Checkout finalizado com sucesso.' };
    } catch (error) {
      console.error('Erro no checkout PDV:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno ao processar venda');
    }
  }
}
