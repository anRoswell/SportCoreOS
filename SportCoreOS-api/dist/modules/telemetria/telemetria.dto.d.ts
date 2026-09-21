export declare class CreateSesionGpsDto {
    fecha_sesion: string;
    partido_id?: string;
    tipo_sesion?: string;
    dispositivo_marca?: string;
    duracion_minutos?: number;
    clima_temperatura?: string;
}
export declare class CreateMetricaGpsDto {
    jugador_id: string;
    distancia_total_m: number;
    velocidad_max_kmh: number;
    distancia_sprint_m?: number;
    sprints_conteo?: number;
    aceleraciones_intensas?: number;
    desaceleraciones_intensas?: number;
    player_load_au?: number;
    frecuencia_cardiaca_prom?: number;
    frecuencia_cardiaca_max?: number;
    coordenadas_heatmap_json?: any[];
}
