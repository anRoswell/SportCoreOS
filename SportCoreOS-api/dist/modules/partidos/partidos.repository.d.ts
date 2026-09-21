import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';
export declare class PartidosRepository extends BaseRepository {
    constructor(db: DatabaseService);
    findPartidosByClub(clubId: string, categoriaId?: string): Promise<any[]>;
    findDetalle(partidoId: string, clubId: string): Promise<{
        partido: any;
        eventosActa: any[];
    }>;
    createPartido(clubId: string, data: any): Promise<any>;
    updatePartido(id: string, clubId: string, data: any): Promise<any>;
    createEventoActa(partidoId: string, data: any): Promise<any>;
}
