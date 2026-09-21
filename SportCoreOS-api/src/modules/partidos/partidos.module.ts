import { Module } from '@nestjs/common';
import { PartidosService } from './partidos.service';
import { PartidosRepository } from './partidos.repository';
import { PartidosController } from './partidos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PartidosController],
  providers: [PartidosService, PartidosRepository],
  exports: [PartidosService, PartidosRepository],
})
export class PartidosModule {}
