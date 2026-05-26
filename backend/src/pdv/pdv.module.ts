import { Module } from '@nestjs/common';
import { PdvController } from './pdv.controller';
import { PdvService } from './pdv.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [],
  controllers: [PdvController],
  providers: [PdvService],
})
export class PdvModule {}
