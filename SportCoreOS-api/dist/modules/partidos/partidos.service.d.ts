import { PartidosRepository } from './partidos.repository';
export declare class PartidosService {
    private readonly partidosRepository;
    constructor(partidosRepository: PartidosRepository);
    findByClub(clubId: string, categoriaId?: string): Promise<any[]>;
    findDetallePartido(partidoId: string, clubId: string): Promise<{
        partido: any;
        eventosActa: any[];
    }>;
    create(clubId: string, data: any): Promise<any>;
    update(id: string, clubId: string, data: any): Promise<any>;
    addEvento(partidoId: string, data: any): Promise<any>;
}
