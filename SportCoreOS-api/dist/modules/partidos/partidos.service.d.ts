import { PartidosRepository } from './partidos.repository';
export declare class PartidosService {
    private readonly partidosRepository;
    constructor(partidosRepository: PartidosRepository);
    findByClub(clubId: string, optionsOrCatId?: string | {
        categoriaId?: string;
        search?: string;
        estado?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findDetallePartido(partidoId: string, clubId: string): Promise<{
        partido: any;
        eventosActa: any[];
    }>;
    create(clubId: string, data: any): Promise<any>;
    update(id: string, clubId: string, data: any): Promise<any>;
    delete(id: string, clubId: string): Promise<{
        success: boolean;
        message: string;
        id: string;
    }>;
    addEvento(partidoId: string, data: any): Promise<any>;
}
