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
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let StorageController = class StorageController {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    async uploadSingleFile(user, file, folder, entidadTipo, entidadId, tipoDocumento) {
        if (!file) {
            throw new common_1.BadRequestException('Debes adjuntar un archivo en el campo "file"');
        }
        return this.storageService.saveFile(file, folder || 'general', user.clubId, user.sub || user.id, entidadTipo, entidadId, tipoDocumento);
    }
    async uploadMultipleFiles(user, files, folder, entidadTipo, entidadId, tipoDocumento) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Debes adjuntar al menos un archivo en el campo "files"');
        }
        return this.storageService.saveMultipleFiles(files, folder || 'general', user.clubId, user.sub || user.id, entidadTipo, entidadId, tipoDocumento);
    }
    async getByEntidad(user, entidadTipo, entidadId) {
        return this.storageService.getArchivosByEntidad(user.clubId, entidadTipo, entidadId);
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
    (0, swagger_1.ApiOperation)({ summary: 'Subir un archivo único con persistencia en BD (Foto, PDF, GPX, Comprobante)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiQuery)({ name: 'folder', required: false, description: 'Módulo de destino (jugadores, tienda, scouting, telemetria, finanzas, clubes, avatars, etc.)' }),
    (0, swagger_1.ApiQuery)({ name: 'entidadTipo', required: false, description: 'Tipo de entidad (JUGADOR, PROSPECTO, PRODUCTO, CLUB, SESION_GPS, PAGO)' }),
    (0, swagger_1.ApiQuery)({ name: 'entidadId', required: false, description: 'UUID de la entidad asociada' }),
    (0, swagger_1.ApiQuery)({ name: 'tipoDocumento', required: false, description: 'FOTO_PERFIL, DOCUMENTO_IDENTIDAD, CERTIFICADO_MEDICO, SOPORTE_PAGO, TRACKING_GPS_RAW, etc.' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('folder')),
    __param(3, (0, common_1.Query)('entidadTipo')),
    __param(4, (0, common_1.Query)('entidadId')),
    __param(5, (0, common_1.Query)('tipoDocumento')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadSingleFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir hasta 10 archivos simultáneos con registro en BD' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiQuery)({ name: 'folder', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'entidadTipo', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'entidadId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tipoDocumento', required: false }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Query)('folder')),
    __param(3, (0, common_1.Query)('entidadTipo')),
    __param(4, (0, common_1.Query)('entidadId')),
    __param(5, (0, common_1.Query)('tipoDocumento')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)('entidad/:entidadTipo/:entidadId'),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar archivos asociados a una entidad (JUGADOR, CLUB, PRODUCTO, etc.)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('entidadTipo')),
    __param(2, (0, common_1.Param)('entidadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getByEntidad", null);
__decorate([
    (0, common_1.Delete)('file'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un archivo físico por ruta relativa' }),
    (0, swagger_1.ApiQuery)({ name: 'path', required: true, description: 'Ruta relativa (ej. /uploads/clubes/.../foto.jpg)' }),
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