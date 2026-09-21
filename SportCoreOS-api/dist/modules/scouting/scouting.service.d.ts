import { ScoutingRepository } from './scouting.repository';
import { CreateProspectoDto, UpdateProspectoDto, CreateEvaluacionDto } from './scouting.dto';
export declare class ScoutingService {
    private readonly scoutingRepo;
    constructor(scoutingRepo: ScoutingRepository);
    findAllProspectos(clubId: string, search?: string, estado?: string, posicion?: string): Promise<any[]>;
    findProspectoById(id: string, clubId: string): Promise<any>;
    createProspecto(clubId: string, dto: CreateProspectoDto): Promise<any>;
    updateProspecto(id: string, clubId: string, dto: UpdateProspectoDto): Promise<any>;
    deleteProspecto(id: string, clubId: string): Promise<any>;
    createEvaluacion(prospectoId: string, clubId: string, scoutUsuarioId: string, dto: CreateEvaluacionDto): Promise<any>;
}
