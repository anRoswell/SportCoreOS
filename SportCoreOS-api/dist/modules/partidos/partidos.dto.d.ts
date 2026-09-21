export declare class CreatePartidoDto {
    categoria_id: string;
    rival_nombre: string;
    fecha_partido: string;
    hora_partido: string;
    hora_citacion?: string;
    sede_cancha: string;
    condicion_juego?: string;
    indumentaria_kit?: string;
    latitud?: number;
    longitud?: number;
}
export declare class UpdatePartidoDto {
    rival_nombre?: string;
    fecha_partido?: string;
    hora_partido?: string;
    hora_citacion?: string;
    sede_cancha?: string;
    condicion_juego?: string;
    indumentaria_kit?: string;
    estado_partido?: string;
    goles_club?: number;
    goles_rival?: number;
}
export declare class CreateEventoActaDto {
    jugador_id?: string;
    minuto_juego: number;
    tipo_evento: string;
    observacion?: string;
    descripcion?: string;
}
