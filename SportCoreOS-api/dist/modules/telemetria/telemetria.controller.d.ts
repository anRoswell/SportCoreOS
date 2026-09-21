import { TelemetriaService } from './telemetria.service';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';
export declare class TelemetriaController {
    private readonly telemetriaService;
    constructor(telemetriaService: TelemetriaService);
    getSesiones(user: any): Promise<any[]>;
    getSesionById(id: string, user: any): Promise<any>;
    createSesion(user: any, dto: CreateSesionGpsDto): Promise<any>;
    createMetrica(id: string, user: any, dto: CreateMetricaGpsDto): Promise<any>;
    getMetricasJugador(jugadorId: string, user: any): Promise<any[]>;
}
