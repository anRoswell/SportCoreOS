export declare class CreateClubDto {
    nombre: string;
    slug?: string;
    sigla: string;
    ciudad?: string;
    pais?: string;
    logoUrl?: string;
    plan?: string;
}
export declare class UpdateClubDto {
    nombre?: string;
    sigla?: string;
    ciudad?: string;
    pais?: string;
    logoUrl?: string;
    plan?: string;
    activo?: boolean;
}
export declare class OnboardingClubDto {
    clubNombre: string;
    sigla: string;
    ciudad: string;
    pais?: string;
    logoUrl?: string;
    adminNombre: string;
    adminApellido: string;
    adminEmail: string;
    adminPassword: string;
    adminTelefono?: string;
}
