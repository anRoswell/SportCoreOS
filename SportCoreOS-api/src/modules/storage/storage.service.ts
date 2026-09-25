import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ArchivosAdjuntosRepository, ArchivoAdjuntoEntity } from './archivos-adjuntos.repository';
import { generateUploadPath, UploadOrigin } from './storage-paths.constants';
import { DatabaseService } from '../../database/database.service';

export interface UploadedFileResponse {
  id?: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  sha256?: string;
  url: string;
  path: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsBasePath = path.resolve(process.cwd(), 'uploads');
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv',
    'application/json',
    'application/gpx+xml',
    'video/mp4',
    'video/quicktime',
  ];
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB

  constructor(
    private readonly archivosRepo: ArchivosAdjuntosRepository,
    private readonly db: DatabaseService,
  ) {
    this.ensureDirectoryExists(this.uploadsBasePath);
  }

  async saveFile(
    file: Express.Multer.File,
    subfolder: string = 'general',
    clubId?: string,
    userId?: string,
    entidadTipo?: string,
    entidadId?: string,
    tipoDocumento?: string,
    origen: UploadOrigin = 'web',
    identificacion?: string,
  ): Promise<UploadedFileResponse> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para subir');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(gpx|fit|csv)$/i)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. Formatos admitidos: Imágenes, PDF, Excel, CSV, GPX, MP4`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de 50MB (Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }

    // Estructuración de ruta tipo ConjuntOS: uploads/clubes/[clubId]/[origen]/[modulo]/[anio]/[mes]/[dia]
    const relativeSubPath = clubId
      ? generateUploadPath(clubId, subfolder, origen)
      : subfolder;

    const targetDir = path.join(this.uploadsBasePath, relativeSubPath);
    this.ensureDirectoryExists(targetDir);

    // 1. Resolver nemotecnia de Club si está disponible
    let clubPrefix = '';
    if (clubId) {
      try {
        const qClub = await this.db.query<{ nombre: string; slug: string; sigla: string; configuracion_json: any }>(
          'SELECT nombre, slug, sigla, configuracion_json FROM core.clubes WHERE id = $1',
          [clubId],
        );
        if (qClub.rows[0]) {
          const c = qClub.rows[0];
          const rawPrefix = c.sigla || c.slug || c.nombre;
          clubPrefix = rawPrefix
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');

          // Si no vino identificación explícita, revisar si el club tiene NIT en su configuración
          if (!identificacion && c.configuracion_json?.nit) {
            identificacion = c.configuracion_json.nit;
          }
        }
      } catch (err: any) {
        this.logger.debug(`No se pudo resolver datos del club para nemotecnia: ${err.message}`);
      }
    }

    // 2. Resolver nemotecnia de Identificación (especialmente fotos de jugadores: número de documento)
    if (!identificacion && entidadTipo === 'JUGADOR' && entidadId) {
      try {
        const qJugador = await this.db.query<{ numero_documento: string }>(
          'SELECT numero_documento FROM core.jugadores WHERE id = $1',
          [entidadId],
        );
        if (qJugador.rows[0]?.numero_documento) {
          identificacion = qJugador.rows[0].numero_documento;
        }
      } catch (err: any) {
        this.logger.debug(`No se pudo resolver documento del jugador para nemotecnia: ${err.message}`);
      }
    }

    const cleanIdent = identificacion
      ? identificacion
          .toString()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

    // 3. Sanitización de nombre original y generación con nemotecnia
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);
    const cleanBaseName = baseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]/g, '_');

    const hash = crypto.randomBytes(4).toString('hex');
    const timestamp = Date.now();

    // Estructuración de nemotecnia: [club]_[identificacion/doc]_[cleanBaseName]_[hash]_[timestamp].[ext]
    const nameParts: string[] = [];
    if (clubPrefix) {
      nameParts.push(clubPrefix);
    }
    if (cleanIdent) {
      nameParts.push(cleanIdent);
    }
    nameParts.push(cleanBaseName);
    nameParts.push(hash);
    nameParts.push(String(timestamp));

    const safeFilename = `${nameParts.join('_')}${ext}`;
    const destinationPath = path.join(targetDir, safeFilename);

    // Calcular hash SHA-256 para integridad criptográfica y desduplicación (Estándar EduCoreOS / ConjuntOS)
    const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.log(`Archivo físico guardado con nemotecnia en: ${destinationPath} (SHA-256: ${sha256.slice(0, 16)}...)`);

    const publicUrl = `/uploads/${relativeSubPath}/${safeFilename}`;

    // Persistir metadatos en la tabla core.archivos_adjuntos si tenemos clubId
    let registroBD: ArchivoAdjuntoEntity | null = null;
    if (clubId) {
      try {
        registroBD = await this.archivosRepo.insertArchivo({
          club_id: clubId,
          entidad_tipo: entidadTipo || null,
          entidad_id: entidadId || null,
          tipo_documento: tipoDocumento || 'GENERAL',
          nombre_original: file.originalname,
          nombre_almacenamiento: safeFilename,
          url: publicUrl,
          mime_type: file.mimetype,
          tamano_bytes: file.size,
          path_almacenamiento: destinationPath,
          metadata: { sha256, extension: ext, subfolder, identificacion: cleanIdent || null, clubPrefix: clubPrefix || null },
          subido_por: userId || null,
        });
      } catch (err: any) {
        this.logger.warn(`Advertencia al registrar metadatos en core.archivos_adjuntos: ${err.message}`);
      }
    }

    return {
      id: registroBD?.id,
      filename: safeFilename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sha256,
      url: publicUrl,
      path: destinationPath,
    };
  }

  async saveMultipleFiles(
    files: Express.Multer.File[],
    subfolder: string = 'general',
    clubId?: string,
    userId?: string,
    entidadTipo?: string,
    entidadId?: string,
    tipoDocumento?: string,
    origen: UploadOrigin = 'web',
    identificacion?: string,
  ): Promise<UploadedFileResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const results: UploadedFileResponse[] = [];
    for (const file of files) {
      const saved = await this.saveFile(file, subfolder, clubId, userId, entidadTipo, entidadId, tipoDocumento, origen, identificacion);
      results.push(saved);
    }

    return results;
  }

  async linkFilesToEntity(
    clubId: string,
    fileIds: string[],
    entityId: string,
    entityType: string,
  ): Promise<void> {
    if (!fileIds || fileIds.length === 0) return;
    await this.archivosRepo.linkFilesToEntity(clubId, fileIds, entityId, entityType);
    this.logger.log(`Vinculados ${fileIds.length} archivos a ${entityType}: ${entityId}`);
  }

  async linkFilesByUrls(
    clubId: string,
    urls: string[],
    entityId: string,
    entityType: string,
  ): Promise<void> {
    if (!urls || urls.length === 0) return;
    await this.archivosRepo.linkFilesToEntityByUrls(clubId, urls, entityId, entityType);
    this.logger.log(`Vinculados ${urls.length} archivos (por URL) a ${entityType}: ${entityId}`);
  }

  async getArchivosByEntidad(clubId: string, entidadTipo: string, entidadId: string): Promise<ArchivoAdjuntoEntity[]> {
    return this.archivosRepo.findByEntity(clubId, entidadTipo, entidadId);
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    try {
      const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      const fullPath = path.resolve(process.cwd(), cleanPath);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        this.logger.log(`Archivo eliminado: ${fullPath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Error al eliminar archivo ${relativePath}:`, error);
      return false;
    }
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
