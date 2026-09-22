"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const archivos_adjuntos_repository_1 = require("./archivos-adjuntos.repository");
const storage_paths_constants_1 = require("./storage-paths.constants");
let StorageService = StorageService_1 = class StorageService {
    archivosRepo;
    logger = new common_1.Logger(StorageService_1.name);
    uploadsBasePath = path.resolve(process.cwd(), 'uploads');
    allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/json',
        'application/gpx+xml',
        'video/mp4',
        'video/quicktime',
    ];
    maxFileSize = 50 * 1024 * 1024;
    constructor(archivosRepo) {
        this.archivosRepo = archivosRepo;
        this.ensureDirectoryExists(this.uploadsBasePath);
    }
    async saveFile(file, subfolder = 'general', clubId, userId, entidadTipo, entidadId, tipoDocumento, origen = 'web') {
        if (!file) {
            throw new common_1.BadRequestException('No se ha proporcionado ningún archivo para subir');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(gpx|fit|csv)$/i)) {
            throw new common_1.BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}. Formatos admitidos: Imágenes, PDF, Excel, CSV, GPX, MP4`);
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`El archivo excede el tamaño máximo permitido de 50MB (Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }
        const relativeSubPath = clubId
            ? (0, storage_paths_constants_1.generateUploadPath)(clubId, subfolder, origen)
            : subfolder;
        const targetDir = path.join(this.uploadsBasePath, relativeSubPath);
        this.ensureDirectoryExists(targetDir);
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext);
        const cleanBaseName = baseName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9.-]/g, '_');
        const hash = crypto.randomBytes(6).toString('hex');
        const timestamp = Date.now();
        const safeFilename = `${cleanBaseName}_${hash}_${timestamp}${ext}`;
        const destinationPath = path.join(targetDir, safeFilename);
        const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
        await fs.promises.writeFile(destinationPath, file.buffer);
        this.logger.log(`Archivo físico guardado en: ${destinationPath} (SHA-256: ${sha256.slice(0, 16)}...)`);
        const publicUrl = `/uploads/${relativeSubPath}/${safeFilename}`;
        let registroBD = null;
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
                    metadata: { sha256, extension: ext, subfolder },
                    subido_por: userId || null,
                });
            }
            catch (err) {
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
    async saveMultipleFiles(files, subfolder = 'general', clubId, userId, entidadTipo, entidadId, tipoDocumento, origen = 'web') {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No se proporcionaron archivos');
        }
        const results = [];
        for (const file of files) {
            const saved = await this.saveFile(file, subfolder, clubId, userId, entidadTipo, entidadId, tipoDocumento, origen);
            results.push(saved);
        }
        return results;
    }
    async linkFilesToEntity(clubId, fileIds, entityId, entityType) {
        if (!fileIds || fileIds.length === 0)
            return;
        await this.archivosRepo.linkFilesToEntity(clubId, fileIds, entityId, entityType);
        this.logger.log(`Vinculados ${fileIds.length} archivos a ${entityType}: ${entityId}`);
    }
    async linkFilesByUrls(clubId, urls, entityId, entityType) {
        if (!urls || urls.length === 0)
            return;
        await this.archivosRepo.linkFilesToEntityByUrls(clubId, urls, entityId, entityType);
        this.logger.log(`Vinculados ${urls.length} archivos (por URL) a ${entityType}: ${entityId}`);
    }
    async getArchivosByEntidad(clubId, entidadTipo, entidadId) {
        return this.archivosRepo.findByEntity(clubId, entidadTipo, entidadId);
    }
    async deleteFile(relativePath) {
        try {
            const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
            const fullPath = path.resolve(process.cwd(), cleanPath);
            if (fs.existsSync(fullPath)) {
                await fs.promises.unlink(fullPath);
                this.logger.log(`Archivo eliminado: ${fullPath}`);
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error al eliminar archivo ${relativePath}:`, error);
            return false;
        }
    }
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [archivos_adjuntos_repository_1.ArchivosAdjuntosRepository])
], StorageService);
//# sourceMappingURL=storage.service.js.map