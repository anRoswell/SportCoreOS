import { CanchasRepository } from './canchas.repository';
import { CreateCanchaDto, UpdateCanchaDto, CreateReservaDto, PagarCajaDto } from './canchas.dto';
export declare class CanchasService {
    private readonly canchasRepo;
    constructor(canchasRepo: CanchasRepository);
    getCanchas(clubId: string): Promise<any[]>;
    createCancha(clubId: string, dto: CreateCanchaDto): Promise<any>;
    updateCancha(id: string, clubId: string, dto: UpdateCanchaDto): Promise<any>;
    getMatrizDisponibilidad(clubId: string, fecha: string): Promise<{
        fecha: string;
        porcentaje_ocupacion: number;
        total_slots: number;
        slots_ocupados: number;
        canchas: any[];
    }>;
    createReserva(clubId: string, dto: CreateReservaDto): Promise<any>;
    registrarPagoCaja(reservaId: string, dto: PagarCajaDto): Promise<any>;
    cancelarReserva(reservaId: string): Promise<any>;
}
