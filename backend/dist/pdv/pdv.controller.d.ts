import { PdvService } from './pdv.service';
import { CheckoutDto } from './dto/checkout.dto';
export declare class PdvController {
    private readonly pdvService;
    constructor(pdvService: PdvService);
    checkout(checkoutDto: CheckoutDto): Promise<{
        message: string;
    }>;
}
