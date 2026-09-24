import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
  exports: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
