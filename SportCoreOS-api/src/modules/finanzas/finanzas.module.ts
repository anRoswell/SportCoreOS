import { Module } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { FinanzasRepository } from './finanzas.repository';
import { FinanzasController } from './finanzas.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FinanzasController],
  providers: [FinanzasService, FinanzasRepository],
  exports: [FinanzasService, FinanzasRepository],
})
export class FinanzasModule {}
