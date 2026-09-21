import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getKPIs(user: any): Promise<{
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
