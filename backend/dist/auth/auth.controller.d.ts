import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
