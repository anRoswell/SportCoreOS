import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TiendaRepository {
  constructor(private readonly db: DatabaseService) {}

  async findCatalogoByClub(clubId: string) {
    const res = await this.db.query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', v.id,
                    'talla', v.talla,
                    'stock_actual', v.stock_actual,
                    'stock_minimo_alerta', v.stock_minimo_alerta
                  )
                ) FILTER (WHERE v.id IS NOT NULL), '[]'
              ) as variantes
       FROM deportivo.productos_tienda p
       LEFT JOIN deportivo.variantes_producto v ON v.producto_id = p.id
       WHERE p.club_id = $1 AND p.activo = true
       GROUP BY p.id
       ORDER BY p.categoria ASC, p.nombre ASC`,
      [clubId],
    );
    return res.rows;
  }

  async findProductoById(id: string, clubId: string) {
    const res = await this.db.query(
      `SELECT * FROM deportivo.productos_tienda WHERE id = $1 AND club_id = $2`,
      [id, clubId],
    );
    return res.rows[0] || null;
  }

  async findVarianteById(varianteId: string) {
    const res = await this.db.query(
      `SELECT v.*, p.club_id, p.nombre as producto_nombre, p.precio_venta, p.codigo_sku
       FROM deportivo.variantes_producto v
       JOIN deportivo.productos_tienda p ON p.id = v.producto_id
       WHERE v.id = $1`,
      [varianteId],
    );
    return res.rows[0] || null;
  }

  async createProducto(clubId: string, data: any) {
    const res = await this.db.query(
      `INSERT INTO deportivo.productos_tienda (
        club_id, codigo_sku, nombre, categoria, precio_venta, foto_url, personalizable, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *`,
      [
        clubId,
        data.codigo_sku,
        data.nombre,
        data.categoria,
        data.precio_venta,
        data.foto_url || null,
        data.personalizable || false,
      ],
    );
    return res.rows[0];
  }

  async updateProducto(id: string, clubId: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, clubId];

    if (data.nombre !== undefined) {
      params.push(data.nombre);
      fields.push(`nombre = $${params.length}`);
    }
    if (data.categoria !== undefined) {
      params.push(data.categoria);
      fields.push(`categoria = $${params.length}`);
    }
    if (data.precio_venta !== undefined) {
      params.push(data.precio_venta);
      fields.push(`precio_venta = $${params.length}`);
    }
    if (data.foto_url !== undefined) {
      params.push(data.foto_url);
      fields.push(`foto_url = $${params.length}`);
    }
    if (data.personalizable !== undefined) {
      params.push(data.personalizable);
      fields.push(`personalizable = $${params.length}`);
    }
    if (data.activo !== undefined) {
      params.push(data.activo);
      fields.push(`activo = $${params.length}`);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const res = await this.db.query(
      `UPDATE deportivo.productos_tienda SET ${fields.join(', ')} WHERE id = $1 AND club_id = $2 RETURNING *`,
      params,
    );
    return res.rows[0] || null;
  }

  async deleteProducto(id: string, clubId: string) {
    const res = await this.db.query(
      `UPDATE deportivo.productos_tienda SET activo = false, updated_at = NOW() WHERE id = $1 AND club_id = $2 RETURNING *`,
      [id, clubId],
    );
    return res.rows[0] || null;
  }

  async createVariante(productoId: string, talla: string, stock: number, stockMinimo: number = 5) {
    const res = await this.db.query(
      `INSERT INTO deportivo.variantes_producto (producto_id, talla, stock_actual, stock_minimo_alerta)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productoId, talla, stock, stockMinimo],
    );
    return res.rows[0];
  }

  async ajustarStock(varianteId: string, nuevoStock: number) {
    const res = await this.db.query(
      `UPDATE deportivo.variantes_producto
       SET stock_actual = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [nuevoStock, varianteId],
    );
    return res.rows[0] || null;
  }

  async decrementarStock(varianteId: string, cantidad: number) {
    const res = await this.db.query(
      `UPDATE deportivo.variantes_producto
       SET stock_actual = stock_actual - $1, updated_at = NOW()
       WHERE id = $2 AND stock_actual >= $1
       RETURNING *`,
      [cantidad, varianteId],
    );
    return res.rows[0] || null;
  }

  async createPedido(data: any) {
    const res = await this.db.query(
      `INSERT INTO deportivo.pedidos_tienda (
        club_id, variante_id, jugador_id, cantidad, precio_unitario, monto_total,
        estampado_nombre, estampado_dorsal, comprador_nombre, comprador_telefono,
        estado_pago, estado_despacho, metodo_pago, codigo_qr
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        data.club_id,
        data.variante_id,
        data.jugador_id || null,
        data.cantidad,
        data.precio_unitario,
        data.monto_total,
        data.estampado_nombre || null,
        data.estampado_dorsal || null,
        data.comprador_nombre || null,
        data.comprador_telefono || null,
        data.estado_pago || 'PAGADO',
        data.estado_despacho || 'PENDIENTE_ENTREGA',
        data.metodo_pago || 'WOMPI_PSE',
        data.codigo_qr,
      ],
    );
    return res.rows[0];
  }

  async findPedidosByClub(clubId: string) {
    const res = await this.db.query(
      `SELECT ped.*, p.nombre as producto_nombre, p.codigo_sku, v.talla,
              j.nombres as jugador_nombres, j.apellidos as jugador_apellidos, j.numero_dorsal as jugador_dorsal
       FROM deportivo.pedidos_tienda ped
       JOIN deportivo.variantes_producto v ON v.id = ped.variante_id
       JOIN deportivo.productos_tienda p ON p.id = v.producto_id
       LEFT JOIN deportivo.jugadores j ON j.id = ped.jugador_id
       WHERE ped.club_id = $1
       ORDER BY ped.created_at DESC`,
      [clubId],
    );
    return res.rows;
  }

  async despacharPedido(pedidoId: string, recibidoPor: string) {
    const res = await this.db.query(
      `UPDATE deportivo.pedidos_tienda
       SET estado_despacho = 'ENTREGADO',
           recibido_por = $1,
           fecha_entrega = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [recibidoPor, pedidoId],
    );
    return res.rows[0] || null;
  }
}
