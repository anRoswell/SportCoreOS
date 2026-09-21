import { Role } from '../../common/enums/role.enum';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol?: Role;
    clubId?: string;
    telefono?: string;
}
export declare class UpdateProfileDto {
    nombre: string;
    apellido: string;
    telefono?: string;
    avatar?: string;
}
export declare class ChangePasswordDto {
    passwordActual: string;
    passwordNuevo: string;
}
