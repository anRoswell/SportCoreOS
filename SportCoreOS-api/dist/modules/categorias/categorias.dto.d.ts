export declare class CreateCategoriaDto {
    nombre: string;
    codigo_categoria: string;
    anio_nacimiento_min: number;
    anio_nacimiento_max: number;
    rama?: string;
    nivel_competencia?: string;
    color_distintivo?: string;
    cupo_maximo?: number;
    director_tecnico_id?: string;
}
export declare class UpdateCategoriaDto {
    nombre?: string;
    codigo_categoria?: string;
    anio_nacimiento_min?: number;
    anio_nacimiento_max?: number;
    rama?: string;
    nivel_competencia?: string;
    color_distintivo?: string;
    cupo_maximo?: number;
    director_tecnico_id?: string;
    activa?: boolean;
}
