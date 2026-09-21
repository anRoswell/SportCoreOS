import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.dto';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    getCategorias(user: any): Promise<any[]>;
    getPlantel(id: string, user: any): Promise<any[]>;
    create(user: any, dto: CreateCategoriaDto): Promise<any>;
    update(id: string, user: any, dto: UpdateCategoriaDto): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
