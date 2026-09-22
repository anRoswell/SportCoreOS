import { CategoriasRepository } from './categorias.repository';
export declare class CategoriasService {
    private readonly categoriasRepository;
    constructor(categoriasRepository: CategoriasRepository);
    findByClub(clubId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        rama?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findPlantelByCategoria(categoriaId: string, clubId: string): Promise<any[]>;
    create(clubId: string, data: any): Promise<any>;
    update(id: string, clubId: string, data: any): Promise<any>;
    delete(id: string, clubId: string): Promise<any>;
}
