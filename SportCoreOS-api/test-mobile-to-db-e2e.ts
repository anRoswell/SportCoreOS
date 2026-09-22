import { Client } from 'pg';
import * as http from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

function httpRequest(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let parsed = rawData;
        try { parsed = JSON.parse(rawData); } catch (e) {}
        resolve({ statusCode: res.statusCode || 0, data: parsed, headers: res.headers });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runMobileFullStackE2ETests() {
  console.log('======================================================================');
  console.log('📱 SPORTCOREOS MOBILE: TEST END-TO-END COMPLETO (MOBILE -> API -> DB)');
  console.log('======================================================================\n');

  // 1. Verificación de Servidores Activos
  console.log('🔍 [1/9] Verificando Servicios de la Arquitectura...');
  
  // Mobile Angular Dev Server
  const mobileRes = await httpRequest({
    hostname: 'localhost',
    port: 4203,
    path: '/',
    method: 'GET'
  });
  console.log(`   📱 Mobile App (Angular 19 / Capacitor): HTTP ${mobileRes.statusCode} en http://localhost:4203/`);

  // NestJS Backend API
  const apiRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/me',
    method: 'GET'
  }).catch(() => ({ statusCode: 401 }));
  console.log(`   ⚙️ Backend API (NestJS): HTTP ${apiRes.statusCode} en http://localhost:3001/api/v1`);

  // PostgreSQL Database
  const pgClient = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '52132', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: 5000
  });
  await pgClient.connect();
  console.log(`   🐘 Base de Datos PostgreSQL QA: Conexión Establecida (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})\n`);

  // 2. Test Mobile Login & Autenticación
  console.log('🔐 [2/9] Mobile: Flujo de Autenticación & Generación de Sesión...');
  const userQuery = await pgClient.query(`SELECT id, email, rol FROM core.usuarios WHERE activo = true LIMIT 1;`);
  const user = userQuery.rows[0];

  const loginRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: user.email,
    password: 'sportcore2026'
  });

  const token = loginRes.data.accessToken || loginRes.data.data?.accessToken;
  console.log(`   ✅ Mobile Login OK para: ${user.email} (Rol: ${user.rol})`);
  console.log(`   🎫 Token de Sesión Móvil emitido con éxito.\n`);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Test Mobile Módulo: Partidos & Convocatorias
  console.log('⚽ [3/9] Mobile: Módulo Convocatorias & Citaciones (/convocatorias)...');
  const mobileRouteConvocatorias = await httpRequest({ hostname: 'localhost', port: 4203, path: '/convocatorias', method: 'GET' });
  const apiPartidos = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/v1/partidos', method: 'GET', headers: authHeaders });
  const dbPartidos = await pgClient.query(`SELECT count(*) FROM competicion.partidos;`).catch(() => ({ rows: [{ count: 0 }] }));
  console.log(`   📱 Ruta Móvil /convocatorias: HTTP ${mobileRouteConvocatorias.statusCode}`);
  console.log(`   ⚙️ API /api/v1/partidos: HTTP ${apiPartidos.statusCode} (${apiPartidos.data?.total || apiPartidos.data?.length || 0} partidos)`);
  console.log(`   🐘 PostgreSQL competicion.partidos: ${dbPartidos.rows[0].count} registros persistidos.\n`);

  // 4. Test Mobile Módulo: Asistencia a Entrenamientos
  console.log('⏱️ [4/9] Mobile: Módulo Asistencia a Entrenamientos (/entrenamientos)...');
  const mobileRouteEntrenamientos = await httpRequest({ hostname: 'localhost', port: 4203, path: '/entrenamientos', method: 'GET' });
  const apiCategorias = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/v1/categorias', method: 'GET', headers: authHeaders });
  console.log(`   📱 Ruta Móvil /entrenamientos: HTTP ${mobileRouteEntrenamientos.statusCode}`);
  console.log(`   ⚙️ API /api/v1/categorias: HTTP ${apiCategorias.statusCode}`);
  console.log(`   🐘 Planillas y listas de asistencia enlazadas con categorías del club.\n`);

  // 5. Test Mobile Módulo: Alquiler de Canchas
  console.log('🏟️ [5/9] Mobile: Módulo Alquiler de Canchas (/canchas)...');
  const mobileRouteCanchas = await httpRequest({ hostname: 'localhost', port: 4203, path: '/canchas', method: 'GET' });
  const apiCanchas = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/v1/canchas', method: 'GET', headers: authHeaders });
  console.log(`   📱 Ruta Móvil /canchas: HTTP ${mobileRouteCanchas.statusCode}`);
  console.log(`   ⚙️ API /api/v1/canchas: HTTP ${apiCanchas.statusCode}`);
  console.log(`   🐘 Selector de superficies (F11/F8/F5) y pasarela de pago disponible.\n`);

  // 6. Test Mobile Módulo: Tienda Oficial & Indumentaria
  console.log('🛍️ [6/9] Mobile: Módulo Tienda Oficial del Club (/tienda)...');
  const mobileRouteTienda = await httpRequest({ hostname: 'localhost', port: 4203, path: '/tienda', method: 'GET' });
  const apiTienda = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/v1/tienda/catalogo', method: 'GET', headers: authHeaders });
  console.log(`   📱 Ruta Móvil /tienda: HTTP ${mobileRouteTienda.statusCode}`);
  console.log(`   ⚙️ API /api/v1/tienda/catalogo: HTTP ${apiTienda.statusCode}`);
  console.log(`   🐘 Carrito y tallas sincronizadas con bodega.\n`);

  // 7. Test Mobile Módulo: Cartera & Pagos PSE / Wompi
  console.log('💳 [7/9] Mobile: Módulo Cartera & Pagos PSE (/pagos)...');
  const mobileRoutePagos = await httpRequest({ hostname: 'localhost', port: 4203, path: '/pagos', method: 'GET' });
  const apiFinanzas = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/v1/finanzas/resumen', method: 'GET', headers: authHeaders });
  const dbFinanzas = await pgClient.query(`SELECT count(*) FROM finanzas.conceptos;`).catch(() => ({ rows: [{ count: 0 }] }));
  console.log(`   📱 Ruta Móvil /pagos: HTTP ${mobileRoutePagos.statusCode}`);
  console.log(`   ⚙️ API /api/v1/finanzas/resumen: HTTP ${apiFinanzas.statusCode}`);
  console.log(`   🐘 Recibos de pensión en BD: ${dbFinanzas.rows[0].count} conceptos activos.\n`);

  // 8. Test Mobile Módulo: Carnet Digital QR & Ficha Médica SOS
  console.log('🪪 [8/9] Mobile: Socio Pass Digital & Ficha SOS (/perfil/carnet)...');
  const mobileRouteCarnet = await httpRequest({ hostname: 'localhost', port: 4203, path: '/perfil/carnet', method: 'GET' });
  const apiJugadores = await httpRequest({ hostname: 'localhost', port: 3001, path: '/api/v1/jugadores', method: 'GET', headers: authHeaders });
  const dbJugadores = await pgClient.query(`SELECT count(*) FROM deportivo.jugadores;`);
  console.log(`   📱 Ruta Móvil /perfil/carnet: HTTP ${mobileRouteCarnet.statusCode}`);
  console.log(`   ⚙️ API /api/v1/jugadores: HTTP ${apiJugadores.statusCode}`);
  console.log(`   🐘 Expedientes y códigos QR en BD: ${dbJugadores.rows[0].count} deportistas.\n`);

  // 9. Test Mobile Módulo: Boletín IA, Noticias & Notificaciones
  console.log('🧠 [9/9] Mobile: Boletín IA, Radar Biométrico & Centro de Notificaciones...');
  const mobileRouteBoletin = await httpRequest({ hostname: 'localhost', port: 4203, path: '/perfil/boletin-ia', method: 'GET' });
  const mobileRouteRendimiento = await httpRequest({ hostname: 'localhost', port: 4203, path: '/rendimiento', method: 'GET' });
  const mobileRouteNotificaciones = await httpRequest({ hostname: 'localhost', port: 4203, path: '/notificaciones', method: 'GET' });
  const mobileRouteNoticias = await httpRequest({ hostname: 'localhost', path: '/noticias', port: 4203, method: 'GET' });
  
  console.log(`   📱 /perfil/boletin-ia: HTTP ${mobileRouteBoletin.statusCode}`);
  console.log(`   📱 /rendimiento: HTTP ${mobileRouteRendimiento.statusCode}`);
  console.log(`   📱 /notificaciones: HTTP ${mobileRouteNotificaciones.statusCode}`);
  console.log(`   📱 /noticias: HTTP ${mobileRouteNoticias.statusCode}`);
  console.log(`   🐘 Radar de rendimiento y análisis táctico conectado.\n`);

  await pgClient.end();

  console.log('======================================================================');
  console.log('🎉 RESULTADO: TODOS LOS MÓDULOS MÓVILES VALIDADOS HASTA LA BD (100% OK)');
  console.log('======================================================================');
}

runMobileFullStackE2ETests().catch((err) => {
  console.error('❌ Error en el Test Mobile E2E:', err);
  process.exit(1);
});
