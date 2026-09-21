import { JwtService } from '@nestjs/jwt';
import { ClubesRepository, ClubEntity } from './clubes.repository';
import { AuthRepository } from '../auth/auth.repository';
import { CreateClubDto, UpdateClubDto, OnboardingClubDto } from './clubes.dto';
import { DatabaseService } from '../../database/database.service';
export declare class ClubesService {
    private readonly clubesRepo;
    private readonly authRepo;
    private readonly db;
    private readonly jwtService;
    private readonly logger;
    constructor(clubesRepo: ClubesRepository, authRepo: AuthRepository, db: DatabaseService, jwtService: JwtService);
    findAll(onlyActive?: boolean): Promise<ClubEntity[]>;
    findClubById(id: string): Promise<ClubEntity>;
    create(dto: CreateClubDto): Promise<ClubEntity>;
    update(id: string, dto: UpdateClubDto): Promise<ClubEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getStaff(clubId: string): Promise<any[]>;
    findSedesByClub(clubId: string): Promise<{
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
    onboarding(dto: OnboardingClubDto): Promise<{
        message: string;
        accessToken: string;
        club: ClubEntity;
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
    private slugify;
}
