import { Module } from '@nestjs/common';
import { BiometriaService } from './biometria.service';
import { BiometriaRepository } from './biometria.repository';
import { BiometriaController } from './biometria.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BiometriaController],
  providers: [BiometriaService, BiometriaRepository],
  exports: [BiometriaService, BiometriaRepository],
})
export class BiometriaModule {}
