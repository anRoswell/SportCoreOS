import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    getMe(user: any): Promise<import("./auth.repository").UserWithClubEntity>;
    updateProfile(user: any, dto: UpdateProfileDto): Promise<{
        message: string;
        user: import("./auth.repository").UserEntity;
    }>;
    changePassword(user: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
