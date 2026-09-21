import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { RegisterDto, UpdateProfileDto, ChangePasswordDto } from './auth.dto';
export declare class AuthService {
    private readonly authRepository;
    private readonly jwtService;
    constructor(authRepository: AuthRepository, jwtService: JwtService);
    login(email: string, pass: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            nombre: string;
            apellido: string;
            rol: string;
            clubId: string;
            clubNombre: string;
            clubSlug: string;
            clubLogo: string;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        message: string;
        user: import("./auth.repository").UserEntity;
    }>;
    getMe(userId: string): Promise<import("./auth.repository").UserWithClubEntity>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        message: string;
        user: import("./auth.repository").UserEntity;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
