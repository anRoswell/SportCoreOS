import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';
import { SlidersRepository } from './sliders.repository';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SlidersController],
  providers: [SlidersService, SlidersRepository],
  exports: [SlidersService, SlidersRepository],
})
export class SlidersModule {}
