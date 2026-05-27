import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        token: string;
    }>;
}
