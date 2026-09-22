import { CondicionJuego, EstadoPartido, TipoEventoActa } from '../../common/enums/domain.enums';
export declare class CreatePartidoDto {
    categoria_id: string;
    rival_nombre: string;
    fecha_partido: string;
    hora_partido: string;
    hora_citacion?: string;
    sede_cancha: string;
    condicion_juego?: CondicionJuego;
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
    condicion_juego?: CondicionJuego;
    indumentaria_kit?: string;
    estado_partido?: EstadoPartido;
    goles_club?: number;
    goles_rival?: number;
}
export declare class CreateEventoActaDto {
    jugador_id?: string;
    minuto_juego: number;
    tipo_evento: TipoEventoActa;
    observacion?: string;
    descripcion?: string;
}
