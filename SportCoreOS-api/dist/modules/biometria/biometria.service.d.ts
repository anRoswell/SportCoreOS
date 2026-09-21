import { DatabaseService } from '../../database/database.service';
export declare class BiometriaService {
    private readonly db;
    constructor(db: DatabaseService);
    registrarEvaluacion(clubId: string, evaluadorId: string, data: any): Promise<any>;
    getHistorialJugador(jugadorId: string): Promise<any[]>;
    findByClub(clubId: string): Promise<any[]>;
}
