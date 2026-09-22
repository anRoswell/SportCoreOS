import { BiometriaService } from './biometria.service';
export declare class BiometriaController {
    private readonly biometriaService;
    constructor(biometriaService: BiometriaService);
    getEvaluaciones(user: any, page?: number, limit?: number, search?: string, categoriaId?: string, diagnostico?: string, sortBy?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    registrarEvaluacion(user: any, data: any): Promise<any>;
    getHistorial(jugadorId: string): Promise<any[]>;
}
