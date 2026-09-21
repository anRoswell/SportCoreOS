import { Module } from '@nestjs/common';
import { CanchasController } from './canchas.controller';
import { CanchasService } from './canchas.service';
import { CanchasRepository } from './canchas.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CanchasController],
  providers: [CanchasService, CanchasRepository],
  exports: [CanchasService, CanchasRepository],
})
export class CanchasModule {}
