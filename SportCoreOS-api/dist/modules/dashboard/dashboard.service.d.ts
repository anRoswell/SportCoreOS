import { DatabaseService } from '../../database/database.service';
export declare class DashboardService {
    private readonly db;
    constructor(db: DatabaseService);
    getExecutiveKPIs(clubId: string): Promise<{
        jugadoresActivos: number;
        jugadoresLesionados: number;
        totalCategorias: number;
        proximosPartidos: any[];
        finanzas: {
            facturadoMes: number;
            recaudadoMes: number;
            carteraMora: number;
            porcentajeRecaudo: number;
        };
        distribucionPosiciones: any[];
    }>;
}
