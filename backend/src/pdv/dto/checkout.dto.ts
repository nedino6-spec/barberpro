import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CheckoutDto {
  @IsArray()
  @IsNotEmpty()
  items: any[];

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsString()
  @IsOptional()
  customerId?: string;
}
