import { Module } from '@nestjs/common';
import { LigaEstadisticasController } from './liga-estadisticas.controller';
import { LigaEstadisticasRepository } from './liga-estadisticas.repository';
import { LigaEstadisticasService } from './liga-estadisticas.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LigaEstadisticasController],
  providers: [LigaEstadisticasService, LigaEstadisticasRepository],
  exports: [LigaEstadisticasService],
})
export class LigaEstadisticasModule {}
