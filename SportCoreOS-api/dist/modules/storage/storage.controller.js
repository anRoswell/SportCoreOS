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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const storage_service_1 = require("./storage.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
let StorageController = class StorageController {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    async uploadSingleFile(file, folder) {
        if (!file) {
            throw new common_1.BadRequestException('Debes adjuntar un archivo en el campo "file"');
        }
        return this.storageService.saveFile(file, folder || 'general');
    }
    async uploadMultipleFiles(files, folder) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Debes adjuntar al menos un archivo en el campo "files"');
        }
        return this.storageService.saveMultipleFiles(files, folder || 'general');
    }
    async deleteFile(filePath) {
        if (!filePath) {
            throw new common_1.BadRequestException('Parámetro "path" es requerido');
        }
        const deleted = await this.storageService.deleteFile(filePath);
        return {
            success: deleted,
            message: deleted ? 'Archivo eliminado correctamente' : 'El archivo no existía en el servidor',
        };
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir un archivo único (Avatar, PDF EPS, Comprobante PSE, etc.)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiQuery)({ name: 'folder', required: false, enum: ['avatars', 'comprobantes', 'documentos', 'biometria', 'general'] }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadSingleFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir hasta 10 archivos simultáneos' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiQuery)({ name: 'folder', required: false, enum: ['avatars', 'comprobantes', 'documentos', 'biometria', 'general'] }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Delete)('file'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un archivo físico por ruta relativa' }),
    (0, swagger_1.ApiQuery)({ name: 'path', required: true, description: 'Ruta relativa (ej. /uploads/avatars/avatar_123.jpg)' }),
    __param(0, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "deleteFile", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('Guardado & Gestión de Archivos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('storage'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map