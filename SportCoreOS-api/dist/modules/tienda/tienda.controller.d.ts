import { TiendaService } from './tienda.service';
import { CreateProductoDto, CreatePedidoDto, DespacharPedidoDto, AjustarStockDto } from './tienda.dto';
export declare class TiendaController {
    private readonly tiendaService;
    constructor(tiendaService: TiendaService);
    getCatalogo(user: any, page?: number, limit?: number, search?: string, categoria?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getProductoById(id: string, user: any): Promise<any>;
    createProducto(user: any, dto: CreateProductoDto): Promise<any>;
    updateProducto(id: string, user: any, dto: any): Promise<any>;
    deleteProducto(id: string, user: any): Promise<any>;
    ajustarStock(id: string, dto: AjustarStockDto): Promise<any>;
    getPedidos(user: any, page?: number, limit?: number, search?: string, estadoDespacho?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createPedido(user: any, dto: CreatePedidoDto): Promise<any>;
    despacharPedido(id: string, dto: DespacharPedidoDto): Promise<any>;
}
