import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';
export declare class PartidosRepository extends BaseRepository {
    constructor(db: DatabaseService);
    findPartidosByClub(clubId: string, optionsOrCatId?: string | {
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
    findDetalle(partidoId: string, clubId: string): Promise<{
        partido: any;
        eventosActa: any[];
    }>;
    createPartido(clubId: string, data: any): Promise<any>;
    updatePartido(id: string, clubId: string, data: any): Promise<any>;
    deletePartido(id: string, clubId: string): Promise<any>;
    createEventoActa(partidoId: string, data: any): Promise<any>;
}
