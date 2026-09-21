const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { AuthService } = require('../dist/modules/auth/auth.service');

async function testNestBackendLogin() {
  console.log('Iniciando NestJS App con AppModule y DatabaseService...');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });

  const authService = app.get(AuthService);
  console.log('\nEjecutando login real con carlos.valderrama@sportcore.com en PostgreSQL QA...');
  
  const loginResult = await authService.login('carlos.valderrama@sportcore.com', 'sportcore2026');
  console.log('✅ ¡LOGIN EXITOSO CONTRA POSTGRESQL QA!');
  console.log('Access Token JWT emitido:', loginResult.accessToken.substring(0, 30) + '...');
  console.log('Datos del usuario autenticado:', loginResult.user);

  console.log('\nEjecutando login real con superadmin@sportcore.com en PostgreSQL QA...');
  const adminResult = await authService.login('superadmin@sportcore.com', 'sportcore2026');
  console.log('✅ ¡LOGIN SUPER ADMIN EXITOSO!');
  console.log('Datos del Super Admin:', adminResult.user);

  await app.close();
  console.log('\n🎉 Prueba NestJS & PostgreSQL QA (@sportcore.com) finalizada con 100% de éxito.');
}

testNestBackendLogin().catch(err => {
  console.error('❌ Error en test backend:', err);
  process.exit(1);
});
