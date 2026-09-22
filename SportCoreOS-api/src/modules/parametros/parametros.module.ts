import { Module, Global } from '@nestjs/common';
import { ParametrosController } from './parametros.controller';
import { ParametrosService } from './parametros.service';
import { ParametrosRepository } from './parametros.repository';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [ParametrosController],
  providers: [ParametrosService, ParametrosRepository],
  exports: [ParametrosService, ParametrosRepository],
})
export class ParametrosModule {}
