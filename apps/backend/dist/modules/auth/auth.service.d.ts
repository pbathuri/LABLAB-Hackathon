import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: Partial<User>;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: Partial<User>;
    }>;
    validateUser(userId: string): Promise<User | null>;
    private generateToken;
    private sanitizeUser;
}
