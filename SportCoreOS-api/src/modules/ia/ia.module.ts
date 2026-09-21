import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { IaRepository } from './ia.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IaController],
  providers: [IaService, IaRepository],
  exports: [IaService],
})
export class IaModule {}
