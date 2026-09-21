import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StorageService, UploadedFileResponse } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Guardado & Gestión de Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir un archivo único (Avatar, PDF EPS, Comprobante PSE, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, enum: ['avatars', 'comprobantes', 'documentos', 'biometria', 'general'] })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general',
  ): Promise<UploadedFileResponse> {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo en el campo "file"');
    }
    return this.storageService.saveFile(file, folder || 'general');
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Subir hasta 10 archivos simultáneos' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, enum: ['avatars', 'comprobantes', 'documentos', 'biometria', 'general'] })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: 'avatars' | 'comprobantes' | 'documentos' | 'biometria' | 'general',
  ): Promise<UploadedFileResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes adjuntar al menos un archivo en el campo "files"');
    }
    return this.storageService.saveMultipleFiles(files, folder || 'general');
  }

  @Delete('file')
  @ApiOperation({ summary: 'Eliminar un archivo físico por ruta relativa' })
  @ApiQuery({ name: 'path', required: true, description: 'Ruta relativa (ej. /uploads/avatars/avatar_123.jpg)' })
  async deleteFile(@Query('path') filePath: string): Promise<{ success: boolean; message: string }> {
    if (!filePath) {
      throw new BadRequestException('Parámetro "path" es requerido');
    }
    const deleted = await this.storageService.deleteFile(filePath);
    return {
      success: deleted,
      message: deleted ? 'Archivo eliminado correctamente' : 'El archivo no existía en el servidor',
    };
  }
}
