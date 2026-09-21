import { JugadoresRepository } from './jugadores.repository';
import { CreateJugadorDto, UpdateJugadorDto, CreateAcudienteDto, CreateBiometriaDto } from './jugadores.dto';
export declare class JugadoresService {
    private readonly jugadoresRepository;
    private readonly logger;
    constructor(jugadoresRepository: JugadoresRepository);
    findAllByClub(clubId: string, search?: string, categoriaId?: string, estado?: string): Promise<any[]>;
    findById(id: string, clubId: string): Promise<any>;
    findExpedienteCompleto(id: string, clubId: string): Promise<{
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
    create(clubId: string, dto: CreateJugadorDto): Promise<{
        message: string;
        jugador: any;
        acudiente: any;
    }>;
    update(id: string, clubId: string, dto: UpdateJugadorDto): Promise<{
        message: string;
        jugador: any;
    }>;
    delete(id: string, clubId: string): Promise<{
        message: string;
    }>;
    addAcudiente(jugadorId: string, clubId: string, dto: CreateAcudienteDto): Promise<{
        message: string;
        acudiente: any;
    }>;
    removeAcudiente(jugadorId: string, clubId: string, acudienteId: string): Promise<{
        message: string;
    }>;
    addEvaluacionBiometrica(jugadorId: string, clubId: string, evaluadorId: string, dto: CreateBiometriaDto): Promise<{
        message: string;
        evaluacion: any;
    }>;
}
