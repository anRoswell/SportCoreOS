import { FinanzasService } from './finanzas.service';
export declare class FinanzasController {
    private readonly finanzasService;
    constructor(finanzasService: FinanzasService);
    getResumen(user: any): Promise<any>;
    getCargos(user: any, categoriaId?: string): Promise<any[]>;
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
