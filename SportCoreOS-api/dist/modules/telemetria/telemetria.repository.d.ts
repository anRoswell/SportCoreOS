import { DatabaseService } from '../../database/database.service';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';
export declare class TelemetriaRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findAllSesiones(clubId: string): Promise<any[]>;
    findSesionById(id: string, clubId: string): Promise<any>;
    createSesion(clubId: string, dto: CreateSesionGpsDto): Promise<any>;
    createMetrica(sesionId: string, dto: CreateMetricaGpsDto): Promise<any>;
    findMetricasByJugador(jugadorId: string, clubId: string): Promise<any[]>;
}
