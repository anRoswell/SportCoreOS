import { Module } from '@nestjs/common';
import { TenantModulesController } from './tenant-modules.controller';
import { TenantModulesService } from './tenant-modules.service';
import { TenantModulesRepository } from './tenant-modules.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TenantModulesController],
  providers: [TenantModulesService, TenantModulesRepository],
  exports: [TenantModulesService, TenantModulesRepository],
})
export class TenantModulesModule {}
