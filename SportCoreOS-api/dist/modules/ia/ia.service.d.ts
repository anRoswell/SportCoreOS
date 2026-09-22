import { IaRepository } from './ia.repository';
import { GenerarBoletinAlumnoDto, ChatTacticoDtDto } from './ia.dto';
export declare class IaService {
    private readonly iaRepo;
    constructor(iaRepo: IaRepository);
    generarBoletinAlumno(clubId: string, dto: GenerarBoletinAlumnoDto): Promise<{
        jugador_id: any;
        jugador_nombre: string;
        categoria: any;
        boletin_markdown: string;
        fortalezas: string[];
        mejoras: string[];
        log_id: any;
    }>;
    analisisFatiga(jugadorId: string): Promise<{
        jugador_id: string;
        nivel_riesgo: string;
        acwr_ratio: number;
        minutos_sugeridos_proximo_partido: number;
        alerta_sobreentrenamiento: boolean;
        recomendacion: string;
        player_load_promedio?: undefined;
        sprints_acumulados?: undefined;
    } | {
        jugador_id: string;
        nivel_riesgo: string;
        acwr_ratio: number;
        player_load_promedio: number;
        sprints_acumulados: any;
        minutos_sugeridos_proximo_partido: number;
        alerta_sobreentrenamiento: boolean;
        recomendacion: string;
    }>;
    chatTacticoDt(clubId: string, dto: ChatTacticoDtDto): Promise<{
        consulta: string;
        sistema: string;
        analisis_tactico: string;
        timestamp: string;
    }>;
    generarGraficaConvocatoriaIa(clubId: string, dto: any): Promise<{
        partido_id: any;
        estilo_diseno: any;
        titular_impacto: string;
        copy_redes_sociales: string;
        hashtags_sugeridos: string;
        paleta_visual: {
            primary: string;
            secondary: string;
            accent: string;
            backgroundStart: string;
            backgroundEnd: string;
            fontHeading: string;
            glowIntensity: number;
        };
        metadata_diseno: {
            motor_ia: string;
            resolucion_optima: string;
            total_titulares: number;
            total_suplentes: number;
            club_sigla: any;
            club_nombre: any;
        };
    }>;
}
