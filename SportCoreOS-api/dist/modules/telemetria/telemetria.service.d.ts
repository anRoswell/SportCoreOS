import { TelemetriaRepository } from './telemetria.repository';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';
export declare class TelemetriaService {
    private readonly telemetriaRepo;
    constructor(telemetriaRepo: TelemetriaRepository);
    findAllSesiones(clubId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        tipoSesion?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findSesionById(id: string, clubId: string): Promise<any>;
    createSesion(clubId: string, dto: CreateSesionGpsDto): Promise<any>;
    createMetrica(sesionId: string, clubId: string, dto: CreateMetricaGpsDto): Promise<any>;
    findMetricasByJugador(jugadorId: string, clubId: string): Promise<any[]>;
}
