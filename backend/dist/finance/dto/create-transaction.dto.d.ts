export declare class CreateTransactionDto {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    paymentMethod: 'MONEY' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
    status?: string;
    barberId?: string;
    barberCommission?: number;
    cashRegisterId?: string;
}
