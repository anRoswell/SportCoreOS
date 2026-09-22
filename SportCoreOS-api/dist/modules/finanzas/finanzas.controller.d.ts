import { FinanzasService } from './finanzas.service';
export declare class FinanzasController {
    private readonly finanzasService;
    constructor(finanzasService: FinanzasService);
    getResumen(user: any): Promise<any>;
    getCargos(user: any, page?: number, limit?: number, search?: string, categoriaId?: string, estadoPago?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    generarMensualidad(user: any, body: {
        mes?: number;
        anio?: number;
    }): Promise<{
        success: boolean;
        cargosCreados: number;
        totalJugadores: number;
    }>;
    registrarPago(id: string, user: any, body: {
        monto: number;
        metodo?: string;
    }): Promise<any>;
}
