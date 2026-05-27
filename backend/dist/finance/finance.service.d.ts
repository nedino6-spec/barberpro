import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    findTransactions(registerId?: string): Promise<({
        barber: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        barberId: string | null;
        date: Date;
        status: string;
        description: string;
        type: string;
        amount: number;
        paymentMethod: string;
        barberCommission: number | null;
        cashRegisterId: string | null;
        appointmentId: string | null;
    })[]>;
    createTransaction(createTransactionDto: CreateTransactionDto): Promise<{
        success: boolean;
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            barberId: string | null;
            date: Date;
            status: string;
            description: string;
            type: string;
            amount: number;
            paymentMethod: string;
            barberCommission: number | null;
            cashRegisterId: string | null;
            appointmentId: string | null;
        };
    }>;
}
