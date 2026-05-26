import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PdvService } from './pdv.service';
import { CheckoutDto } from './dto/checkout.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('pdv')
@UseGuards(AuthGuard('jwt'))
export class PdvController {
  constructor(private readonly pdvService: PdvService) {}

  @Post('checkout')
  checkout(@Body() checkoutDto: CheckoutDto) {
    return this.pdvService.checkout(checkoutDto);
  }
}
