export declare enum TipoDocumento {
    TI = "TI",
    CC = "CC",
    RC = "RC",
    CE = "CE",
    PASAPORTE = "PASAPORTE"
}
export declare enum PiernaHabil {
    DIESTRO = "DIESTRO",
    ZURDO = "ZURDO",
    AMBIDIESTRO = "AMBIDIESTRO"
}
export declare enum Genero {
    MASCULINO = "MASCULINO",
    FEMENINO = "FEMENINO"
}
export declare enum EstadoMatricula {
    ACTIVO = "ACTIVO",
    SUSPENDIDO = "SUSPENDIDO",
    LESIONADO = "LESIONADO",
    RETIRADO = "RETIRADO"
}
export declare class CreateJugadorDto {
    categoriaId: string;
    nombres: string;
    apellidos: string;
    tipoDocumento?: TipoDocumento;
    numeroDocumento: string;
    fechaNacimiento: string;
    genero?: Genero;
    fotoUrl?: string;
    posicionPrincipal: string;
    posicionSecundaria?: string;
    piernaHabil?: PiernaHabil;
    numeroDorsal?: number;
    eps?: string;
    estadoMatricula?: EstadoMatricula;
    acudienteNombres?: string;
    acudienteApellidos?: string;
    acudienteNumeroDocumento?: string;
    acudienteTelefono?: string;
    acudienteEmail?: string;
    acudienteParentesco?: string;
}
export declare class UpdateJugadorDto {
    categoriaId?: string;
    nombres?: string;
    apellidos?: string;
    tipoDocumento?: TipoDocumento;
    numeroDocumento?: string;
    fechaNacimiento?: string;
    genero?: Genero;
    fotoUrl?: string;
    posicionPrincipal?: string;
    posicionSecundaria?: string;
    piernaHabil?: PiernaHabil;
    numeroDorsal?: number;
    eps?: string;
    estadoMatricula?: EstadoMatricula;
}
export declare class CreateAcudienteDto {
    nombres: string;
    apellidos: string;
    tipoDocumento?: string;
    numeroDocumento: string;
    telefonoMovil: string;
    email?: string;
    parentesco?: string;
    direccionResidencia?: string;
    esContactoPrincipal?: boolean;
    autorizadoRecoger?: boolean;
}
export declare class CreateBiometriaDto {
    fechaEvaluacion?: string;
    pesoKg: number;
    tallaCm: number;
    testCooperMetros?: number;
    velocidad30mSeg?: number;
    saltoVerticalCm?: number;
    observaciones?: string;
}
