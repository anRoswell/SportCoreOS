import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasRepository } from './categorias.repository';
import { CategoriasController } from './categorias.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriasRepository],
  exports: [CategoriasService, CategoriasRepository],
})
export class CategoriasModule {}
