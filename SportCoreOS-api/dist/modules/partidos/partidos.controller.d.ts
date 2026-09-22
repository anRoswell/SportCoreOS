import { PartidosService } from './partidos.service';
import { CreatePartidoDto, UpdatePartidoDto, CreateEventoActaDto } from './partidos.dto';
export declare class PartidosController {
    private readonly partidosService;
    constructor(partidosService: PartidosService);
    getPartidos(user: any, page?: number, limit?: number, search?: string, categoriaId?: string, estado?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDetalle(id: string, user: any): Promise<{
        partido: any;
        eventosActa: any[];
    }>;
    create(user: any, dto: CreatePartidoDto): Promise<any>;
    update(id: string, user: any, dto: UpdatePartidoDto): Promise<any>;
    delete(id: string, user: any): Promise<{
        success: boolean;
        message: string;
        id: string;
    }>;
    addEvento(id: string, dto: CreateEventoActaDto): Promise<any>;
}
