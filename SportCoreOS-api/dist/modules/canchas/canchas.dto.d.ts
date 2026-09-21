export declare class CreateCanchaDto {
    nombre: string;
    tipo_superficie: string;
    precio_hora_diurna: number;
    precio_hora_nocturna: number;
    hora_apertura?: string;
    hora_cierre?: string;
}
export declare class UpdateCanchaDto {
    nombre?: string;
    tipo_superficie?: string;
    precio_hora_diurna?: number;
    precio_hora_nocturna?: number;
    activa?: boolean;
}
export declare class CreateReservaDto {
    cancha_id: string;
    fecha_reserva: string;
    hora_inicio: string;
    hora_fin: string;
    tipo_reserva: string;
    cliente_nombre?: string;
    cliente_telefono?: string;
    monto_anticipo?: number;
    metodo_pago?: string;
}
export declare class PagarCajaDto {
    monto: number;
    metodo_pago: string;
}
