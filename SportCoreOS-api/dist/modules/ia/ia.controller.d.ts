import { IaService } from './ia.service';
import { GenerarBoletinAlumnoDto, ChatTacticoDtDto } from './ia.dto';
export declare class IaController {
    private readonly iaService;
    constructor(iaService: IaService);
    generarBoletinAlumno(user: any, dto: GenerarBoletinAlumnoDto): Promise<{
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
    chatTacticoDt(user: any, dto: ChatTacticoDtDto): Promise<{
        consulta: string;
        sistema: string;
        analisis_tactico: string;
        timestamp: string;
    }>;
}
