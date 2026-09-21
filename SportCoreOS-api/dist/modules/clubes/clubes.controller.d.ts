import { ClubesService } from './clubes.service';
import { CreateClubDto, UpdateClubDto, OnboardingClubDto } from './clubes.dto';
export declare class ClubesController {
    private readonly clubesService;
    constructor(clubesService: ClubesService);
    onboarding(dto: OnboardingClubDto): Promise<{
        message: string;
        accessToken: string;
        club: import("./clubes.repository").ClubEntity;
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
    getAll(onlyActive?: string): Promise<import("./clubes.repository").ClubEntity[]>;
    getMiClub(user: any): Promise<import("./clubes.repository").ClubEntity>;
    getSedes(user: any): Promise<{
        id: string;
        clubId: string;
        nombre: string;
        direccion: string;
        ciudad: string;
        activa: boolean;
        canchas: {
            id: string;
            nombre: string;
            tipoSuperficie: string;
            formato: string;
            tieneIluminacion: boolean;
            precioHoraAlquiler: number;
        }[];
    }[]>;
    getById(id: string): Promise<import("./clubes.repository").ClubEntity>;
    getStaff(id: string): Promise<any[]>;
    create(dto: CreateClubDto): Promise<import("./clubes.repository").ClubEntity>;
    update(id: string, dto: UpdateClubDto): Promise<import("./clubes.repository").ClubEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
