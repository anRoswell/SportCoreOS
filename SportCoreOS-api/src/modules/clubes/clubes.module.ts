import { Module } from '@nestjs/common';
import { ClubesService } from './clubes.service';
import { ClubesRepository } from './clubes.repository';
import { ClubesController } from './clubes.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClubesController],
  providers: [ClubesService, ClubesRepository],
  exports: [ClubesService, ClubesRepository],
})
export class ClubesModule {}
