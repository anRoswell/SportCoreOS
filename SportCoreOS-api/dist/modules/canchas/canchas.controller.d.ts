import { CanchasService } from './canchas.service';
import { CreateCanchaDto, UpdateCanchaDto, CreateReservaDto, PagarCajaDto } from './canchas.dto';
export declare class CanchasController {
    private readonly canchasService;
    constructor(canchasService: CanchasService);
    getCanchas(user: any): Promise<any[]>;
    createCancha(user: any, dto: CreateCanchaDto): Promise<any>;
    updateCancha(id: string, user: any, dto: UpdateCanchaDto): Promise<any>;
    getDisponibilidad(user: any, fecha: string): Promise<{
        fecha: string;
        porcentaje_ocupacion: number;
        total_slots: number;
        slots_ocupados: number;
        canchas: any[];
    }>;
    createReserva(user: any, dto: CreateReservaDto): Promise<any>;
    registrarPagoCaja(id: string, dto: PagarCajaDto): Promise<any>;
    cancelarReserva(id: string): Promise<any>;
}
