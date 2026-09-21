import { BiometriaService } from './biometria.service';
export declare class BiometriaController {
    private readonly biometriaService;
    constructor(biometriaService: BiometriaService);
    getEvaluaciones(user: any): Promise<any[]>;
    registrarEvaluacion(user: any, data: any): Promise<any>;
    getHistorial(jugadorId: string): Promise<any[]>;
}
