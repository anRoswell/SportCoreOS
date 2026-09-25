import {
  Controller,
  Get,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Guardado & Gestión de Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir un archivo único con persistencia en BD (Foto, PDF, GPX, Comprobante)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, description: 'Módulo de destino (jugadores, tienda, scouting, telemetria, finanzas, clubes, avatars, etc.)' })
  @ApiQuery({ name: 'entidadTipo', required: false, description: 'Tipo de entidad (JUGADOR, PROSPECTO, PRODUCTO, CLUB, SESION_GPS, PAGO)' })
  @ApiQuery({ name: 'entidadId', required: false, description: 'UUID de la entidad asociada' })
  @ApiQuery({ name: 'tipoDocumento', required: false, description: 'FOTO_PERFIL, DOCUMENTO_IDENTIDAD, CERTIFICADO_MEDICO, SOPORTE_PAGO, TRACKING_GPS_RAW, etc.' })
  @ApiQuery({ name: 'identificacion', required: false, description: 'NIT del club o número de documento de identidad del jugador' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('entidadTipo') entidadTipo?: string,
    @Query('entidadId') entidadId?: string,
    @Query('tipoDocumento') tipoDocumento?: string,
    @Query('identificacion') identificacion?: string,
  ): Promise<UploadedFileResponse> {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo en el campo "file"');
    }
    return this.storageService.saveFile(
      file,
      folder || 'general',
      user.clubId,
      user.sub || user.id,
      entidadTipo,
      entidadId,
      tipoDocumento,
      'web',
      identificacion,
    );
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Subir hasta 10 archivos simultáneos con registro en BD' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false })
  @ApiQuery({ name: 'entidadTipo', required: false })
  @ApiQuery({ name: 'entidadId', required: false })
  @ApiQuery({ name: 'tipoDocumento', required: false })
  @ApiQuery({ name: 'identificacion', required: false })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
    @Query('entidadTipo') entidadTipo?: string,
    @Query('entidadId') entidadId?: string,
    @Query('tipoDocumento') tipoDocumento?: string,
    @Query('identificacion') identificacion?: string,
  ): Promise<UploadedFileResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes adjuntar al menos un archivo en el campo "files"');
    }
    return this.storageService.saveMultipleFiles(
      files,
      folder || 'general',
      user.clubId,
      user.sub || user.id,
      entidadTipo,
      entidadId,
      tipoDocumento,
      'web',
      identificacion,
    );
  }

  @Get('entidad/:entidadTipo/:entidadId')
  @ApiOperation({ summary: 'Consultar archivos asociados a una entidad (JUGADOR, CLUB, PRODUCTO, etc.)' })
  async getByEntidad(
    @CurrentUser() user: any,
    @Param('entidadTipo') entidadTipo: string,
    @Param('entidadId') entidadId: string,
  ) {
    return this.storageService.getArchivosByEntidad(user.clubId, entidadTipo, entidadId);
  }

  @Delete('file')
  @ApiOperation({ summary: 'Eliminar un archivo físico por ruta relativa' })
  @ApiQuery({ name: 'path', required: true, description: 'Ruta relativa (ej. /uploads/clubes/.../foto.jpg)' })
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
