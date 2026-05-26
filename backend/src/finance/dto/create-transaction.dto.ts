import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(['INCOME', 'EXPENSE'])
  @IsNotEmpty()
  type: 'INCOME' | 'EXPENSE';

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['MONEY', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD'])
  @IsNotEmpty()
  paymentMethod: 'MONEY' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  barberId?: string;

  @IsNumber()
  @IsOptional()
  barberCommission?: number;

  @IsString()
  @IsOptional()
  cashRegisterId?: string;
}
