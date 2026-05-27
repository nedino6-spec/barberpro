import { PrismaService } from '../prisma/prisma.service';
import { QueueDto, ReviewDto, AiChatDto } from './dto/bot.dto';
export declare class BotService {
    private prisma;
    private openai;
    constructor(prisma: PrismaService);
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
