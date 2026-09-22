import { DatabaseService } from '../../database/database.service';
export declare class TiendaRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findCatalogoByClub(clubId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        categoria?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findProductoById(id: string, clubId: string): Promise<any>;
    findVarianteById(varianteId: string): Promise<any>;
    createProducto(clubId: string, data: any): Promise<any>;
    updateProducto(id: string, clubId: string, data: any): Promise<any>;
    deleteProducto(id: string, clubId: string): Promise<any>;
    createVariante(productoId: string, talla: string, stock: number, stockMinimo?: number): Promise<any>;
    ajustarStock(varianteId: string, nuevoStock: number): Promise<any>;
    decrementarStock(varianteId: string, cantidad: number): Promise<any>;
    createPedido(data: any): Promise<any>;
    findPedidosByClub(clubId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
        estadoDespacho?: string;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    despacharPedido(pedidoId: string, recibidoPor: string): Promise<any>;
}
