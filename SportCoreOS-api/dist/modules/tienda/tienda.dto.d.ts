import { CategoriaProductoTienda, MetodoPago } from '../../common/enums/domain.enums';
export declare class CreateVarianteDto {
    talla: string;
    stock_actual: number;
    stock_minimo_alerta?: number;
}
export declare class CreateProductoDto {
    codigo_sku: string;
    nombre: string;
    categoria: CategoriaProductoTienda;
    precio_venta: number;
    foto_url?: string;
    personalizable?: boolean;
    variantes?: CreateVarianteDto[];
}
export declare class UpdateProductoDto {
    nombre?: string;
    categoria?: string;
    precio_venta?: number;
    foto_url?: string;
    personalizable?: boolean;
    activo?: boolean;
}
export declare class CreatePedidoDto {
    variante_id: string;
    cantidad: number;
    jugador_id?: string;
    estampado_nombre?: string;
    estampado_dorsal?: number;
    comprador_nombre?: string;
    comprador_telefono?: string;
    metodo_pago?: MetodoPago;
}
export declare class DespacharPedidoDto {
    recibido_por: string;
}
export declare class AjustarStockDto {
    stock_actual: number;
}
