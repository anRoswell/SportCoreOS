"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const clubes_module_1 = require("./modules/clubes/clubes.module");
const categorias_module_1 = require("./modules/categorias/categorias.module");
const jugadores_module_1 = require("./modules/jugadores/jugadores.module");
const biometria_module_1 = require("./modules/biometria/biometria.module");
const partidos_module_1 = require("./modules/partidos/partidos.module");
const convocatorias_module_1 = require("./modules/convocatorias/convocatorias.module");
const finanzas_module_1 = require("./modules/finanzas/finanzas.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const storage_module_1 = require("./modules/storage/storage.module");
const canchas_module_1 = require("./modules/canchas/canchas.module");
const tienda_module_1 = require("./modules/tienda/tienda.module");
const ia_module_1 = require("./modules/ia/ia.module");
const scouting_module_1 = require("./modules/scouting/scouting.module");
const telemetria_module_1 = require("./modules/telemetria/telemetria.module");
const tenant_middleware_1 = require("./common/middleware/tenant.middleware");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_middleware_1.TenantMiddleware).forRoutes('{*path}');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.example'],
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            storage_module_1.StorageModule,
            clubes_module_1.ClubesModule,
            categorias_module_1.CategoriasModule,
            jugadores_module_1.JugadoresModule,
            biometria_module_1.BiometriaModule,
            partidos_module_1.PartidosModule,
            convocatorias_module_1.ConvocatoriasModule,
            finanzas_module_1.FinanzasModule,
            dashboard_module_1.DashboardModule,
            canchas_module_1.CanchasModule,
            tienda_module_1.TiendaModule,
            ia_module_1.IaModule,
            scouting_module_1.ScoutingModule,
            telemetria_module_1.TelemetriaModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map