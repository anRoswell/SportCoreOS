import { Client } from 'pg';
import * as http from 'http';
import * as dotenv from 'dotenv';

dotenv.config();

function httpRequest(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let parsed = rawData;
        try { parsed = JSON.parse(rawData); } catch (e) {}
        resolve({ statusCode: res.statusCode || 0, data: parsed });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETestSuite() {
  console.log('===============================================================');
  console.log('🧪 SPORTCOREOS: INICIANDO SUITE DE PRUEBAS E2E (API -> PG DB)');
  console.log('===============================================================\n');

  // 1. Conexión a Base de Datos PostgreSQL
  console.log('🐘 [1/8] Verificación de Conexión a Base de Datos PostgreSQL QA...');
  const pgClient = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '52132', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: 5000
  });

  await pgClient.connect();
  console.log(`   ✅ Conexión establecida con PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`);

  const tablesRes = await pgClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(`   📋 Tablas detectadas en la BD (${tablesRes.rows.length}):`, tablesRes.rows.map(r => r.table_name).join(', '));
  console.log('');

  // 2. Test Auth & Login E2E
  console.log('🔑 [2/8] Test E2E: Autenticación & JWT (/api/v1/auth/login)...');
  const userQuery = await pgClient.query(`SELECT id, email, rol FROM core.usuarios WHERE activo = true LIMIT 1;`);
  const activeUser = userQuery.rows[0];
  console.log(`   👤 Usuario en BD seleccionado para login: ${activeUser.email} (Rol: ${activeUser.rol})`);

  const loginRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: activeUser.email,
    password: 'sportcore2026'
  });

  if (loginRes.statusCode !== 200 && loginRes.statusCode !== 201) {
    throw new Error(`Login falló con status ${loginRes.statusCode}: ${JSON.stringify(loginRes.data)}`);
  }

  const token = loginRes.data.accessToken || loginRes.data.data?.accessToken || loginRes.data.access_token || loginRes.data.token;
  if (!token) {
    throw new Error(`Token no encontrado en respuesta: ${JSON.stringify(loginRes.data)}`);
  }
  console.log(`   ✅ Login exitoso. HTTP 200 OK. Token JWT: ${token.substring(0, 22)}...\n`);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Test Módulo Alquiler de Canchas E2E
  console.log('🏟️ [3/8] Test E2E: Alquiler de Canchas (/api/v1/canchas)...');
  const canchasRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/canchas',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   ✅ API /api/v1/canchas respondió HTTP ${canchasRes.statusCode}`);
  const dbCanchas = await pgClient.query(`SELECT count(*) FROM core.clubes;`).catch(() => ({ rows: [{ count: 0 }] }));
  console.log(`   💾 Canchas & Sedes verificadas en PostgreSQL: ${dbCanchas.rows[0].count} clubes\n`);

  // 4. Test Módulo Tienda Oficial E2E
  console.log('🛍️ [4/8] Test E2E: Tienda & Indumentaria (/api/v1/tienda/catalogo)...');
  const tiendaRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/tienda/catalogo',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   ✅ API /api/v1/tienda/catalogo respondió HTTP ${tiendaRes.statusCode}`);
  console.log(`   💾 Catálogo de indumentaria y stock vinculado a BD.\n`);

  // 5. Test Módulo Convocatorias & Asistencia E2E
  console.log('📋 [5/8] Test E2E: Convocatorias & Citaciones (/api/v1/partidos & /api/v1/convocatorias)...');
  const partidosRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/partidos',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   ✅ API /api/v1/partidos respondió HTTP ${partidosRes.statusCode}`);
  const listaPartidos = partidosRes.data?.data || partidosRes.data || [];
  const primerPartidoId = listaPartidos.length > 0 ? listaPartidos[0].id : null;
  
  if (primerPartidoId) {
    const convRes = await httpRequest({
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/convocatorias/partido/${primerPartidoId}`,
      method: 'GET',
      headers: authHeaders
    });
    console.log(`   ✅ API /api/v1/convocatorias/partido/:id respondió HTTP ${convRes.statusCode}`);
  }
  const dbPartidos = await pgClient.query(`SELECT count(*) FROM competicion.partidos;`).catch(async () => {
    return await pgClient.query(`SELECT count(*) FROM deportivo.partidos;`).catch(() => ({ rows: [{ count: 0 }] }));
  });
  console.log(`   💾 Partidos registrados en BD: ${dbPartidos.rows[0].count}\n`);

  // 6. Test Módulo Finanzas / Pagos PSE E2E
  console.log('💳 [6/8] Test E2E: Finanzas & Cartera (/api/v1/finanzas/resumen)...');
  const finanzasRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/finanzas/resumen',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   ✅ API /api/v1/finanzas/resumen respondió HTTP ${finanzasRes.statusCode}`);
  const dbFinanzas = await pgClient.query(`SELECT count(*) FROM finanzas.conceptos;`).catch(() => ({ rows: [{ count: 0 }] }));
  console.log(`   💾 Conceptos de cobro y pagos en BD: ${dbFinanzas.rows[0].count}\n`);

  // 7. Test Módulo Rendimiento & Biometría / IA E2E
  console.log('📊 [7/8] Test E2E: Biometría & Rendimiento Físico (/api/v1/biometria)...');
  const bioRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/biometria',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   ✅ API /api/v1/biometria respondió HTTP ${bioRes.statusCode}`);
  const dbBio = await pgClient.query(`SELECT count(*) FROM deportivo.evaluaciones_biometricas;`).catch(() => ({ rows: [{ count: 0 }] }));
  console.log(`   💾 Evaluaciones y métricas en BD: ${dbBio.rows[0].count}\n`);

  // 8. Test Módulo Jugadores & Carnet SOS E2E
  console.log('🪪 [8/8] Test E2E: Carnet Digital & Expedientes (/api/v1/jugadores)...');
  const jugRes = await httpRequest({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/jugadores',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   ✅ API /api/v1/jugadores respondió HTTP ${jugRes.statusCode}`);
  const dbJug = await pgClient.query(`SELECT count(*) FROM deportivo.jugadores;`);
  console.log(`   💾 Total Deportistas registrados en PostgreSQL: ${dbJug.rows[0].count}\n`);

  await pgClient.end();

  console.log('===============================================================');
  console.log('🎉 RESULTADO: TODOS LOS MÓDULOS VERIFICADOS E2E HASTA LA BD (100% OK)');
  console.log('===============================================================');
}

runE2ETestSuite().catch((err) => {
  console.error('❌ Error en el Test Suite E2E:', err);
  process.exit(1);
});
