import { JugadoresService } from './jugadores.service';
import { CreateJugadorDto, UpdateJugadorDto, CreateAcudienteDto, CreateBiometriaDto } from './jugadores.dto';
export declare class JugadoresController {
    private readonly jugadoresService;
    constructor(jugadoresService: JugadoresService);
    getJugadores(user: any, page?: number, limit?: number, search?: string, categoriaId?: string, estado?: string, posicion?: string, genero?: string, sortBy?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(id: string, user: any): Promise<any>;
    getExpediente(id: string, user: any): Promise<{
        jugador: any;
        acudientes: any[];
        historialBiometrico: any[];
        historialFinanciero: any[];
        resumenFinanciero: {
            totalFacturado: any;
            totalPagado: any;
            saldoPendiente: any;
            estadoCuenta: string;
        };
    }>;
    create(user: any, dto: CreateJugadorDto): Promise<{
        message: string;
        jugador: any;
        acudiente: any;
    }>;
    update(id: string, user: any, dto: UpdateJugadorDto): Promise<{
        message: string;
        jugador: any;
    }>;
    delete(id: string, user: any): Promise<{
        message: string;
    }>;
    addAcudiente(id: string, user: any, dto: CreateAcudienteDto): Promise<{
        message: string;
        acudiente: any;
    }>;
    removeAcudiente(id: string, acudienteId: string, user: any): Promise<{
        message: string;
    }>;
    addBiometria(id: string, user: any, dto: CreateBiometriaDto): Promise<{
        message: string;
        evaluacion: any;
    }>;
}
