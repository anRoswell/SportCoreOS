import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';

export interface ArchivoAdjuntoEntity {
  id: string;
  club_id: string;
  entidad_tipo?: string;
  entidad_id?: string;
  tipo_documento: string;
  nombre_original: string;
  nombre_almacenamiento: string;
  url: string;
  mime_type?: string;
  tamano_bytes: number;
  path_almacenamiento: string;
  metadata?: any;
  subido_por?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ArchivosAdjuntosRepository extends BaseRepository<ArchivoAdjuntoEntity> {
  constructor(db: DatabaseService) {
    super(db, 'core.archivos_adjuntos');
  }

  async insertArchivo(data: {
    club_id: string;
    entidad_tipo?: string | null;
    entidad_id?: string | null;
    tipo_documento?: string;
    nombre_original: string;
    nombre_almacenamiento: string;
    url: string;
    mime_type?: string;
    tamano_bytes: number;
    path_almacenamiento: string;
    metadata?: any;
    subido_por?: string | null;
  }): Promise<ArchivoAdjuntoEntity> {
    const query = `
      INSERT INTO core.archivos_adjuntos (
        club_id, entidad_tipo, entidad_id, tipo_documento,
        nombre_original, nombre_almacenamiento, url, mime_type,
        tamano_bytes, path_almacenamiento, metadata, subido_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const res = await this.db.query(query, [
      data.club_id,
      data.entidad_tipo || null,
      data.entidad_id || null,
      data.tipo_documento || 'GENERAL',
      data.nombre_original,
      data.nombre_almacenamiento,
      data.url,
      data.mime_type || null,
      data.tamano_bytes,
      data.path_almacenamiento,
      JSON.stringify(data.metadata || {}),
      data.subido_por || null,
    ]);
    return res.rows[0];
  }

  async linkFilesToEntity(
    clubId: string,
    fileIds: string[],
    entityId: string,
    entityType: string,
  ): Promise<void> {
    const query = `
      UPDATE core.archivos_adjuntos
      SET entidad_id = $1, entidad_tipo = $2, updated_at = NOW()
      WHERE id = ANY($3) AND club_id = $4
    `;
    await this.db.query(query, [entityId, entityType, fileIds, clubId]);
  }

  async linkFilesToEntityByUrls(
    clubId: string,
    urls: string[],
    entityId: string,
    entityType: string,
  ): Promise<void> {
    const query = `
      UPDATE core.archivos_adjuntos
      SET entidad_id = $1, entidad_tipo = $2, updated_at = NOW()
      WHERE url = ANY($3) AND club_id = $4
    `;
    await this.db.query(query, [entityId, entityType, urls, clubId]);
  }

  async findByEntity(clubId: string, entityType: string, entityId: string): Promise<ArchivoAdjuntoEntity[]> {
    const query = `
      SELECT * FROM core.archivos_adjuntos
      WHERE club_id = $1 AND entidad_tipo = $2 AND entidad_id = $3 AND activo = true
      ORDER BY created_at DESC
    `;
    const res = await this.db.query(query, [clubId, entityType, entityId]);
    return res.rows;
  }
}
