import { DatabaseService } from '../../database/database.service';
export declare class TiendaRepository {
    private readonly db;
    constructor(db: DatabaseService);
    findCatalogoByClub(clubId: string): Promise<any[]>;
    findProductoById(id: string, clubId: string): Promise<any>;
    findVarianteById(varianteId: string): Promise<any>;
    createProducto(clubId: string, data: any): Promise<any>;
    updateProducto(id: string, clubId: string, data: any): Promise<any>;
    deleteProducto(id: string, clubId: string): Promise<any>;
    createVariante(productoId: string, talla: string, stock: number, stockMinimo?: number): Promise<any>;
    ajustarStock(varianteId: string, nuevoStock: number): Promise<any>;
    decrementarStock(varianteId: string, cantidad: number): Promise<any>;
    createPedido(data: any): Promise<any>;
    findPedidosByClub(clubId: string): Promise<any[]>;
    despacharPedido(pedidoId: string, recibidoPor: string): Promise<any>;
}
