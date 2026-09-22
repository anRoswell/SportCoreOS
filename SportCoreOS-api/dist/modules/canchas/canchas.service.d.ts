import { CanchasRepository } from './canchas.repository';
import { CreateCanchaDto, UpdateCanchaDto, CreateReservaDto, PagarCajaDto } from './canchas.dto';
export declare class CanchasService {
    private readonly canchasRepo;
    constructor(canchasRepo: CanchasRepository);
    getCanchas(clubId: string, options?: {
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
    getCanchaById(id: string, clubId: string): Promise<any>;
    createCancha(clubId: string, dto: CreateCanchaDto): Promise<any>;
    updateCancha(id: string, clubId: string, dto: UpdateCanchaDto): Promise<any>;
    deleteCancha(id: string, clubId: string): Promise<{
        success: boolean;
        message: string;
        id: string;
    }>;
    getMatrizDisponibilidad(clubId: string, fecha: string): Promise<{
        fecha: string;
        porcentaje_ocupacion: number;
        total_slots: any;
        slots_ocupados: any;
        canchas: any;
    }>;
    createReserva(clubId: string, dto: CreateReservaDto): Promise<any>;
    registrarPagoCaja(reservaId: string, dto: PagarCajaDto): Promise<any>;
    cancelarReserva(reservaId: string): Promise<any>;
}
