import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadedFileResponse {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
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
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.ensureDirectoryExists(this.uploadsBasePath);
  }

  async saveFile(
    file: Express.Multer.File,
    subfolder: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general' = 'general',
  ): Promise<UploadedFileResponse> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo para subir');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. Formatos admitidos: JPG, PNG, WEBP, PDF, XLSX, CSV`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de 10MB (Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
    }

    const targetDir = path.join(this.uploadsBasePath, subfolder);
    this.ensureDirectoryExists(targetDir);

    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(12).toString('hex');
    const timestamp = Date.now();
    const safeFilename = `${subfolder}_${hash}_${timestamp}${ext}`;
    const destinationPath = path.join(targetDir, safeFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);
    this.logger.log(`Archivo guardado exitosamente: ${destinationPath}`);

    const publicUrl = `/uploads/${subfolder}/${safeFilename}`;

    return {
      filename: safeFilename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: publicUrl,
      path: destinationPath,
    };
  }

  async saveMultipleFiles(
    files: Express.Multer.File[],
    subfolder: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general' = 'general',
  ): Promise<UploadedFileResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const results: UploadedFileResponse[] = [];
    for (const file of files) {
      const saved = await this.saveFile(file, subfolder);
      results.push(saved);
    }

    return results;
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
