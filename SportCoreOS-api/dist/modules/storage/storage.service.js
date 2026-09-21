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
let StorageService = StorageService_1 = class StorageService {
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
    ];
    maxFileSize = 10 * 1024 * 1024;
    constructor() {
        this.ensureDirectoryExists(this.uploadsBasePath);
    }
    async saveFile(file, subfolder = 'general') {
        if (!file) {
            throw new common_1.BadRequestException('No se ha proporcionado ningún archivo para subir');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}. Formatos admitidos: JPG, PNG, WEBP, PDF, XLSX, CSV`);
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`El archivo excede el tamaño máximo permitido de 10MB (Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
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
    async saveMultipleFiles(files, subfolder = 'general') {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No se proporcionaron archivos');
        }
        const results = [];
        for (const file of files) {
            const saved = await this.saveFile(file, subfolder);
            results.push(saved);
        }
        return results;
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
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map