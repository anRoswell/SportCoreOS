import { DatabaseService } from '../../database/database.service';
export declare class ConvocatoriasService {
    private readonly db;
    constructor(db: DatabaseService);
    findByPartido(partidoId: string): Promise<{
        partido: any;
        convocatoria: {
            id: string;
            partido_id: string;
        };
        jugadores: any[];
    }>;
    responderConvocatoria(convocatoriaId: string, estado: string, motivoExcusa?: string, jugadorId?: string): Promise<any>;
}
