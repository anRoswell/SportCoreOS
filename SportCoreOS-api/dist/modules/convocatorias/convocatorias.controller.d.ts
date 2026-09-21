import { ConvocatoriasService } from './convocatorias.service';
export declare class ConvocatoriasController {
    private readonly convocatoriasService;
    constructor(convocatoriasService: ConvocatoriasService);
    getByPartido(partidoId: string): Promise<{
        partido: any;
        convocatoria: {
            id: string;
            partido_id: string;
        };
        jugadores: any[];
    }>;
    responder(convocatoriaId: string, body: {
        estado: string;
        motivoExcusa?: string;
        jugadorId?: string;
    }): Promise<any>;
}
