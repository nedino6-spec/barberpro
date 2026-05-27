import { BotService } from './bot.service';
import { QueueDto, ReviewDto, AiChatDto } from './dto/bot.dto';
export declare class BotController {
    private readonly botService;
    constructor(botService: BotService);
    getCustomerInfo(phone: string): Promise<{
        customer: {
            name: string;
            points: number;
            vipLevel: string;
            debtBalance: number;
            queuePosition: number;
        };
    }>;
    joinQueue(queueDto: QueueDto): Promise<{
        success: boolean;
        position: number;
    }>;
    saveReview(reviewDto: ReviewDto): Promise<{
        success: boolean;
    }>;
    processAiChat(aiChatDto: AiChatDto): Promise<{
        reply: string;
    }>;
}
