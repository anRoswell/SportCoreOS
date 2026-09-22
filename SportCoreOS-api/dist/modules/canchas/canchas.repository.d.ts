import { DatabaseService } from '../../database/database.service';
export declare class CanchasRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findCanchasByClub(clubId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        tipoSuperficie?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findCanchaById(id: string, clubId: string): Promise<any>;
    createCancha(clubId: string, data: any): Promise<any>;
    updateCancha(id: string, clubId: string, data: any): Promise<any>;
    deleteCancha(id: string, clubId: string): Promise<any>;
    findReservasByFecha(clubId: string, fecha: string): Promise<any[]>;
    findConflictoReserva(canchaId: string, fecha: string, horaInicio: string, horaFin: string, excludeReservaId?: string): Promise<any>;
    createReserva(data: any): Promise<any>;
    registrarPagoCaja(reservaId: string, monto: number): Promise<any>;
    cancelarReserva(reservaId: string): Promise<any>;
}
