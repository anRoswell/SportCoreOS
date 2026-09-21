import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';
export declare class CategoriasRepository extends BaseRepository {
    constructor(db: DatabaseService);
    findCategoriasByClub(clubId: string): Promise<any[]>;
    findPlantelByCategoria(categoriaId: string, clubId: string): Promise<any[]>;
    createCategoria(clubId: string, data: any): Promise<any>;
    updateCategoria(id: string, clubId: string, data: any): Promise<any>;
    deleteCategoria(id: string, clubId: string): Promise<any>;
}
