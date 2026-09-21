import { ScoutingService } from './scouting.service';
import { CreateProspectoDto, UpdateProspectoDto, CreateEvaluacionDto } from './scouting.dto';
export declare class ScoutingController {
    private readonly scoutingService;
    constructor(scoutingService: ScoutingService);
    getProspectos(user: any, search?: string, estado?: string, posicion?: string): Promise<any[]>;
    getProspectoById(id: string, user: any): Promise<any>;
    createProspecto(user: any, dto: CreateProspectoDto): Promise<any>;
    updateProspecto(id: string, user: any, dto: UpdateProspectoDto): Promise<any>;
    deleteProspecto(id: string, user: any): Promise<any>;
    createEvaluacion(id: string, user: any, dto: CreateEvaluacionDto): Promise<any>;
}
