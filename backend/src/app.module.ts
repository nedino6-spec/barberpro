import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BullModule } from '@nestjs/bullmq';
import { FinanceModule } from './finance/finance.module';
import { PdvModule } from './pdv/pdv.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    // BullMQ desativado localmente para evitar spam no Windows sem Redis
    PrismaModule,
    AuthModule,
    AppointmentsModule,
    FinanceModule,
    PdvModule,
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
