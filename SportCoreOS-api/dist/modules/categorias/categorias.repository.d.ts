import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';
export declare class CategoriasRepository extends BaseRepository {
    constructor(db: DatabaseService);
    findCategoriasByClub(clubId: string, options?: {
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
    createCategoria(clubId: string, data: any): Promise<any>;
    updateCategoria(id: string, clubId: string, data: any): Promise<any>;
    deleteCategoria(id: string, clubId: string): Promise<any>;
}
