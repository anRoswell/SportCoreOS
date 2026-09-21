export declare class CreateProspectoDto {
    nombres_apellidos: string;
    fecha_nacimiento: string;
    posicion_principal: string;
    posicion_secundaria?: string;
    pie_habil?: string;
    club_origen?: string;
    telefono_contacto?: string;
    email_contacto?: string;
    ciudad?: string;
    altura_cm?: number;
    peso_kg?: number;
    video_highlight_url?: string;
    estado_scouting?: string;
    notas_scout?: string;
}
export declare class UpdateProspectoDto {
    nombres_apellidos?: string;
    posicion_principal?: string;
    club_origen?: string;
    estado_scouting?: string;
    valoracion_general?: number;
    notas_scout?: string;
}
export declare class CreateEvaluacionDto {
    fecha_observacion?: string;
    partido_evento?: string;
    score_tecnico: number;
    score_tactico: number;
    score_fisico: number;
    score_mental: number;
    comentarios_cualitativos?: string;
    recomendacion: string;
}
