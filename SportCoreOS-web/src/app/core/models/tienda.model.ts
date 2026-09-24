import { MetodoPagoTienda, EstadoDespachoPedido, TiendaCategoriaProducto } from '../enums/domain.enums';

export interface VarianteTienda {
  id?: string;
  producto_id?: string;
  talla: string;
  stock_actual: number;
  stock_minimo_alerta?: number;
}

export interface ProductoTienda {
  id?: string;
  codigo_sku: string;
  nombre: string;
  descripcion?: string;
  categoria: TiendaCategoriaProducto | string;
  precio_venta: number;
  personalizable: boolean;
  foto_url?: string;
  activo?: boolean;
  variantes?: VarianteTienda[];
}

export interface PedidoTienda {
  id?: string;
  codigo_qr: string;
  producto_id?: string;
  producto_nombre?: string;
  talla: string;
  cantidad: number;
  estampado_nombre?: string;
  estampado_dorsal?: number | null;
  comprador_nombre?: string;
  comprador_telefono?: string;
  total?: number;
  metodo_pago?: MetodoPagoTienda | string;
  estado_entrega?: EstadoDespachoPedido | string;
  fecha_pedido?: string;
  entregado_por?: string;
  recibido_por?: string;
}

export interface CreatePedidoTiendaDto {
  variante_id: string;
  cantidad: number;
  estampado_nombre?: string;
  estampado_dorsal?: number | null;
  comprador_nombre?: string;
  comprador_telefono?: string;
  metodo_pago?: MetodoPagoTienda | string;
}

export interface CreateProductoTiendaDto {
  codigo_sku: string;
  nombre: string;
  categoria: string;
  precio_venta: number;
  personalizable: boolean;
  variantes: { talla: string; stock_actual: number }[];
}
