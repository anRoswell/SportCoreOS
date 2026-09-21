import { DatabaseService } from '../../database/database.service';
export declare class IaRepository {
    private readonly db;
    constructor(db: DatabaseService);
    getPlantillaByCodigo(codigo: string): Promise<any>;
    getHistorialJugadorParaBoletin(jugadorId: string, clubId: string): Promise<{
        jugador: any;
        biometria: any[];
        partidos: any[];
    }>;
    getMetricasFatigaJugador(jugadorId: string): Promise<any[]>;
    guardarLogGeneracion(clubId: string, jugadorId: string | null, codigoTemplate: string, promptTokens: number, completionTokens: number, contenidoGenerado: string, metadata?: any): Promise<any>;
    getPlantelesParaAnalisis(categoriaId: string, clubId: string): Promise<any[]>;
}
