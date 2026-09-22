import { DatabaseService } from '../../database/database.service';
export declare class BiometriaService {
    private readonly db;
    constructor(db: DatabaseService);
    registrarEvaluacion(clubId: string, evaluadorId: string, data: any): Promise<any>;
    getHistorialJugador(jugadorId: string): Promise<any[]>;
    findByClub(clubId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        categoriaId?: string;
        diagnostico?: string;
        sortBy?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
