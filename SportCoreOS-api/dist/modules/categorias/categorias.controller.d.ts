import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.dto';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    getCategorias(user: any, page?: number, limit?: number, search?: string, rama?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getPlantel(id: string, user: any): Promise<any[]>;
    create(user: any, dto: CreateCategoriaDto): Promise<any>;
    update(id: string, user: any, dto: UpdateCategoriaDto): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
