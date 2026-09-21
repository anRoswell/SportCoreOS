import { Module } from '@nestjs/common';
import { BiometriaService } from './biometria.service';
import { BiometriaController } from './biometria.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BiometriaController],
  providers: [BiometriaService],
  exports: [BiometriaService],
})
export class BiometriaModule {}
