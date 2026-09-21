import { Module } from '@nestjs/common';
import { TiendaController } from './tienda.controller';
import { TiendaService } from './tienda.service';
import { TiendaRepository } from './tienda.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TiendaController],
  providers: [TiendaService, TiendaRepository],
  exports: [TiendaService, TiendaRepository],
})
export class TiendaModule {}
