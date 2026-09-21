import { TiendaRepository } from './tienda.repository';
import { CreateProductoDto, CreatePedidoDto, DespacharPedidoDto, AjustarStockDto } from './tienda.dto';
export declare class TiendaService {
    private readonly tiendaRepo;
    constructor(tiendaRepo: TiendaRepository);
    getCatalogo(clubId: string): Promise<any[]>;
    createProducto(clubId: string, dto: CreateProductoDto): Promise<any>;
    updateProducto(id: string, clubId: string, dto: any): Promise<any>;
    deleteProducto(id: string, clubId: string): Promise<any>;
    ajustarStock(varianteId: string, dto: AjustarStockDto): Promise<any>;
    createPedido(clubId: string, dto: CreatePedidoDto): Promise<any>;
    getPedidos(clubId: string): Promise<any[]>;
    despacharPedido(pedidoId: string, dto: DespacharPedidoDto): Promise<any>;
}
