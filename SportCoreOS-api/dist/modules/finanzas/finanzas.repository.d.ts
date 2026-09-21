import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';
export declare class FinanzasRepository extends BaseRepository {
    constructor(db: DatabaseService);
    getResumenFinanciero(clubId: string): Promise<any>;
    getCargosPorCobrar(clubId: string, categoriaId?: string): Promise<any[]>;
    generarMensualidad(clubId: string, mes: number, anio: number): Promise<{
        success: boolean;
        cargosCreados: number;
        totalJugadores: number;
    }>;
    registrarPago(id: string, clubId: string, monto: number): Promise<any>;
}
