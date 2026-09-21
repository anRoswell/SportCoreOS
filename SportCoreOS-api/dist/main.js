"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('FutCoreOS_Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    const uploadsPath = path.resolve(process.cwd(), 'uploads');
    app.useStaticAssets(uploadsPath, {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('⚽ SportCoreOS / FutCoreOS API')
        .setDescription('API RESTful transversal para la administración integral de escuelas y clubes de fútbol formativo')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Auth & Seguridad', 'Autenticación JWT, registro, perfiles y control de acceso')
        .addTag('Guardado & Gestión de Archivos', 'Carga de avatares, comprobantes PSE y documentos PDF')
        .addTag('Clubes & Sedes', 'Gestión multi-tenant de academias y canchas')
        .addTag('Categorías Deportivas', 'Sub-7 a Sub-20 y cuerpo técnico')
        .addTag('Jugadores & Familias', 'Expediente deportivo, médico y acudientes')
        .addTag('Biometría & Rendimiento', 'Antropometría, test de Cooper y radar técnico')
        .addTag('Partidos & Convocatorias', 'Fixture, citación interactiva y actas de juego')
        .addTag('Finanzas & Pagos PSE', 'Matrículas, mensualidades y pasarelas de pago')
        .addTag('Dashboard & Métricas', 'KPIs ejecutivos y deportivos en tiempo real')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'SportCoreOS API Docs | SECTIC S.A.S.',
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`⚽ SportCoreOS API corriendo exitosamente en el puerto ${port}`);
    logger.log(`📚 Swagger Docs disponible en: http://localhost:${port}/api/docs`);
    logger.log(`📁 Carpeta de archivos estáticos activa en: ${uploadsPath} (Prefix: /uploads/)`);
}
bootstrap();
//# sourceMappingURL=main.js.map