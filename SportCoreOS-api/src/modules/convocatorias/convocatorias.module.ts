import { Module } from '@nestjs/common';
import { ConvocatoriasService } from './convocatorias.service';
import { ConvocatoriasRepository } from './convocatorias.repository';
import { ConvocatoriasController } from './convocatorias.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ConvocatoriasController],
  providers: [ConvocatoriasService, ConvocatoriasRepository],
  exports: [ConvocatoriasService, ConvocatoriasRepository],
})
export class ConvocatoriasModule {}
