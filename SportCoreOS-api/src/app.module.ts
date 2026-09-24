import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClubesModule } from './modules/clubes/clubes.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { JugadoresModule } from './modules/jugadores/jugadores.module';
import { BiometriaModule } from './modules/biometria/biometria.module';
import { PartidosModule } from './modules/partidos/partidos.module';
import { ConvocatoriasModule } from './modules/convocatorias/convocatorias.module';
import { FinanzasModule } from './modules/finanzas/finanzas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StorageModule } from './modules/storage/storage.module';
import { CanchasModule } from './modules/canchas/canchas.module';
import { TiendaModule } from './modules/tienda/tienda.module';
import { IaModule } from './modules/ia/ia.module';
import { ScoutingModule } from './modules/scouting/scouting.module';
import { TelemetriaModule } from './modules/telemetria/telemetria.module';
import { TenantModulesModule } from './modules/tenant-modules/tenant-modules.module';
import { ParametrosModule } from './modules/parametros/parametros.module';
import { RolesModule } from './modules/roles/roles.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { RetosModule } from './modules/retos/retos.module';
import { SlidersModule } from './modules/sliders/sliders.module';
import { LandingsModule } from './modules/landings/landings.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    DatabaseModule,
    AuthModule,
    StorageModule,
    ClubesModule,
    CategoriasModule,
    JugadoresModule,
    BiometriaModule,
    PartidosModule,
    ConvocatoriasModule,
    FinanzasModule,
    DashboardModule,
    CanchasModule,
    TiendaModule,
    IaModule,
    ScoutingModule,
    TelemetriaModule,
    TenantModulesModule,
    ParametrosModule,
    RolesModule,
    ServiciosModule,
    RetosModule,
    SlidersModule,
    LandingsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('{*path}');
  }
}
