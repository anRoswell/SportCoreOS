import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ArchivosAdjuntosRepository } from './archivos-adjuntos.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StorageController],
  providers: [StorageService, ArchivosAdjuntosRepository],
  exports: [StorageService, ArchivosAdjuntosRepository],
})
export class StorageModule {}
