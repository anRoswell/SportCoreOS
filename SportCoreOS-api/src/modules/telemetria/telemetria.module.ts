import { Module } from '@nestjs/common';
import { TelemetriaController } from './telemetria.controller';
import { TelemetriaService } from './telemetria.service';
import { TelemetriaRepository } from './telemetria.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TelemetriaController],
  providers: [TelemetriaService, TelemetriaRepository],
  exports: [TelemetriaService],
})
export class TelemetriaModule {}
