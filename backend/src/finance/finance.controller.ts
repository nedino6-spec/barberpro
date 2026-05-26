import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('finance')
@UseGuards(AuthGuard('jwt'))
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('transactions')
  findTransactions(@Query('registerId') registerId?: string) {
    return this.financeService.findTransactions(registerId);
  }

  @Post('transactions')
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.financeService.createTransaction(createTransactionDto);
  }
}
