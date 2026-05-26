import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BotService } from './bot.service';
import { QueueDto, ReviewDto, AiChatDto } from './dto/bot.dto';

// Bot routes are usually internal or protected by an API key. 
// For now, they are unprotected to match previous implementation, 
// but we recommend adding a guard checking an X-API-KEY from the bot.

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get('customer')
  getCustomerInfo(@Query('phone') phone: string) {
    return this.botService.getCustomerInfo(phone);
  }

  @Post('queue')
  joinQueue(@Body() queueDto: QueueDto) {
    return this.botService.joinQueue(queueDto);
  }

  @Post('review')
  saveReview(@Body() reviewDto: ReviewDto) {
    return this.botService.saveReview(reviewDto);
  }

  @Post('ai-chat')
  processAiChat(@Body() aiChatDto: AiChatDto) {
    return this.botService.processAiChat(aiChatDto);
  }
}
