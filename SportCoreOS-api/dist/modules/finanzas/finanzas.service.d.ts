import { FinanzasRepository } from './finanzas.repository';
export declare class FinanzasService {
    private readonly finanzasRepository;
    constructor(finanzasRepository: FinanzasRepository);
    getResumenFinanciero(clubId: string): Promise<any>;
    getCargosPorCobrar(clubId: string, categoriaId?: string): Promise<any[]>;
    generarMensualidad(clubId: string, mes: number, anio: number): Promise<{
        success: boolean;
        cargosCreados: number;
        totalJugadores: number;
    }>;
    registrarPago(id: string, clubId: string, monto: number): Promise<any>;
}
