import { CanchasService } from './canchas.service';
import { CreateCanchaDto, UpdateCanchaDto, CreateReservaDto, PagarCajaDto } from './canchas.dto';
export declare class CanchasController {
    private readonly canchasService;
    constructor(canchasService: CanchasService);
    getCanchas(user: any, page?: number, limit?: number, search?: string, tipoSuperficie?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDisponibilidad(user: any, fecha: string): Promise<{
        fecha: string;
        porcentaje_ocupacion: number;
        total_slots: any;
        slots_ocupados: any;
        canchas: any;
    }>;
    getCanchaById(id: string, user: any): Promise<any>;
    createCancha(user: any, dto: CreateCanchaDto): Promise<any>;
    updateCancha(id: string, user: any, dto: UpdateCanchaDto): Promise<any>;
    deleteCancha(id: string, user: any): Promise<{
        success: boolean;
        message: string;
        id: string;
    }>;
    createReserva(user: any, dto: CreateReservaDto): Promise<any>;
    registrarPagoCaja(id: string, dto: PagarCajaDto): Promise<any>;
    cancelarReserva(id: string): Promise<any>;
}
