import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
export declare class PdvService {
    private prisma;
    constructor(prisma: PrismaService);
    checkout(checkoutDto: CheckoutDto): Promise<{
        message: string;
    }>;
}
