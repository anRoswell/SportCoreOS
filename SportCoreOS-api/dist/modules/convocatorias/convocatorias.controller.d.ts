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
    addJugador(partidoId: string, body: {
        jugadorId: string;
        rol?: string;
        posicion?: string;
    }): Promise<any>;
    removeJugador(partidoId: string, jugadorId: string): Promise<any>;
    cambiarRol(partidoId: string, jugadorId: string, body: {
        rol: string;
    }): Promise<any>;
    sugerir(partidoId: string, body: {
        limiteTitulares?: number;
        limiteSuplentes?: number;
    }): Promise<{
        partido: any;
        convocatoria: {
            id: string;
            partido_id: string;
        };
        jugadores: any[];
    }>;
}
