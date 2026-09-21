import { Module } from '@nestjs/common';
import { ScoutingController } from './scouting.controller';
import { ScoutingService } from './scouting.service';
import { ScoutingRepository } from './scouting.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScoutingController],
  providers: [ScoutingService, ScoutingRepository],
  exports: [ScoutingService],
})
export class ScoutingModule {}
