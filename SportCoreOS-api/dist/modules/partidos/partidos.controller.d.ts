import { PartidosService } from './partidos.service';
import { CreatePartidoDto, UpdatePartidoDto, CreateEventoActaDto } from './partidos.dto';
export declare class PartidosController {
    private readonly partidosService;
    constructor(partidosService: PartidosService);
    getPartidos(user: any, categoriaId?: string): Promise<any[]>;
    getDetalle(id: string, user: any): Promise<{
        partido: any;
        eventosActa: any[];
    }>;
    create(user: any, dto: CreatePartidoDto): Promise<any>;
    update(id: string, user: any, dto: UpdatePartidoDto): Promise<any>;
    addEvento(id: string, dto: CreateEventoActaDto): Promise<any>;
}
