import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('FutCoreOS_Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Servir archivos estáticos subidos (/uploads/...)
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Validación estricta de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuración de Swagger / OpenAPI
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SportCoreOS API Docs | SECTIC S.A.S.',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`⚽ SportCoreOS API corriendo exitosamente en el puerto ${port}`);
  logger.log(`📚 Swagger Docs disponible en: http://localhost:${port}/api/docs`);
  logger.log(`📁 Carpeta de archivos estáticos activa en: ${uploadsPath} (Prefix: /uploads/)`);
}

bootstrap();
