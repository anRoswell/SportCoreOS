import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ServiciosController } from './servicios.controller';
import { ServiciosService } from './servicios.service';
import { ServiciosRepository } from './servicios.repository';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ServiciosController],
  providers: [ServiciosService, ServiciosRepository],
  exports: [ServiciosService, ServiciosRepository],
})
export class ServiciosModule {}
