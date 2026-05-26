import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async findTransactions(registerId?: string) {
    return this.prisma.finance.findMany({
      where: registerId ? { cashRegisterId: registerId } : undefined,
      orderBy: { date: 'desc' },
      include: {
        barber: { select: { name: true } },
      },
      take: 50,
    });
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { type, amount, description, paymentMethod, status, barberId, barberCommission, cashRegisterId } = createTransactionDto;

    if (cashRegisterId) {
      const register = await this.prisma.cashRegister.findUnique({
        where: { id: cashRegisterId },
      });
      if (!register || register.status !== 'OPEN') {
        throw new BadRequestException('O caixa selecionado não está aberto.');
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
}
