import { DatabaseService } from '../../database/database.service';
import { CreateProspectoDto, UpdateProspectoDto, CreateEvaluacionDto } from './scouting.dto';
export declare class ScoutingRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findAllProspectos(clubId: string, optionsOrSearch?: string | {
        page?: number;
        limit?: number;
        search?: string;
        estado?: string;
        posicion?: string;
    }, estadoParam?: string, posicionParam?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findProspectoById(id: string, clubId: string): Promise<any>;
    createProspecto(clubId: string, dto: CreateProspectoDto): Promise<any>;
    updateProspecto(id: string, clubId: string, dto: UpdateProspectoDto): Promise<any>;
    deleteProspecto(id: string, clubId: string): Promise<any>;
    createEvaluacion(prospectoId: string, scoutUsuarioId: string, dto: CreateEvaluacionDto): Promise<any>;
}
