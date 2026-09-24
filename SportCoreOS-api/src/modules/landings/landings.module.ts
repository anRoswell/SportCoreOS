import { Module } from '@nestjs/common';
import { LandingsController } from './landings.controller';
import { LandingsService } from './landings.service';
import { LandingsRepository } from './landings.repository';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [LandingsController],
  providers: [LandingsService, LandingsRepository],
  exports: [LandingsService, LandingsRepository],
})
export class LandingsModule {}
