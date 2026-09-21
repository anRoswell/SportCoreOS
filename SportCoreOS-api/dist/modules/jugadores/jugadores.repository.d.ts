import { DatabaseService } from '../../database/database.service';
export declare class JugadoresRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findJugadoresByClub(clubId: string, search?: string, categoriaId?: string, estado?: string): Promise<any[]>;
    findById(id: string, clubId: string): Promise<any>;
    findByDorsal(clubId: string, categoriaId: string, dorsal: number, excludeId?: string): Promise<any>;
    findByDocumento(clubId: string, numeroDocumento: string, excludeId?: string): Promise<any>;
    createJugador(data: {
        clubId: string;
        categoriaId: string;
        nombres: string;
        apellidos: string;
        tipoDocumento: string;
        numeroDocumento: string;
        fechaNacimiento: string;
        genero: string;
        fotoUrl?: string | null;
        posicionPrincipal: string;
        posicionSecundaria?: string | null;
        piernaHabil: string;
        numeroDorsal?: number | null;
        eps?: string | null;
        estadoMatricula?: string;
    }): Promise<any>;
    updateJugador(id: string, clubId: string, data: any): Promise<any>;
    deleteJugador(id: string, clubId: string): Promise<boolean>;
    findExpediente(id: string, clubId: string): Promise<{
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
    createAcudiente(data: {
        nombres: string;
        apellidos: string;
        tipoDocumento: string;
        numeroDocumento: string;
        telefonoMovil: string;
        email?: string | null;
        parentesco: string;
        direccionResidencia?: string | null;
    }): Promise<any>;
    linkJugadorAcudiente(jugadorId: string, acudienteId: string, esPrincipal?: boolean, autorizadoRecoger?: boolean): Promise<any>;
    removeJugadorAcudiente(jugadorId: string, acudienteId: string): Promise<boolean>;
    createEvaluacionBiometrica(data: {
        jugadorId: string;
        evaluadorId?: string | null;
        fechaEvaluacion: string;
        pesoKg: number;
        tallaCm: number;
        imc: number;
        testCooperMetros?: number | null;
        velocidad30mSeg?: number | null;
        saltoVerticalCm?: number | null;
        observaciones?: string | null;
    }): Promise<any>;
}
