import { Module } from '@nestjs/common';
import { JugadoresService } from './jugadores.service';
import { JugadoresRepository } from './jugadores.repository';
import { JugadoresController } from './jugadores.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JugadoresController],
  providers: [JugadoresService, JugadoresRepository],
  exports: [JugadoresService, JugadoresRepository],
})
export class JugadoresModule {}
