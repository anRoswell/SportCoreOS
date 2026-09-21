const { Pool } = require('pg');
const fs = require('fs');

async function migrateModularSchemas() {
  console.log('🏗️ INICIANDO MIGRACIÓN MODULAR A SCHEMAS DDD EN POSTGRESQL QA...');

  // 1. Primero conectar como educore_user_qa para crear schemas y otorgar permisos
  const adminPool = new Pool({
    host: '100.120.112.79',
    port: 52132,
    user: 'educore_user_qa',
    password: 'Ing3n13r0D3v3l0p3r_EduCoreOS_QA2026*',
    database: 'sportcoreos_db_qa',
  });

  const adminClient = await adminPool.connect();
  const schemas = ['core', 'deportivo', 'competicion', 'rendimiento', 'finanzas', 'operaciones'];

  for (const s of schemas) {
    await adminClient.query(`CREATE SCHEMA IF NOT EXISTS ${s};`);
    await adminClient.query(`GRANT ALL ON SCHEMA ${s} TO sportcore_user_qa;`);
    await adminClient.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${s} TO sportcore_user_qa;`);
    await adminClient.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ${s} TO sportcore_user_qa;`);
    await adminClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA ${s} GRANT ALL ON TABLES TO sportcore_user_qa;`);
    await adminClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA ${s} GRANT ALL ON SEQUENCES TO sportcore_user_qa;`);
  }
  console.log('✅ Schemas creados y permisos otorgados a sportcore_user_qa.');

  adminClient.release();
  await adminPool.end();

  // 2. Conectar como sportcore_user_qa para aplicar DDL y Seeds
  const appPool = new Pool({
    host: '100.120.112.79',
    port: 52132,
    user: 'sportcore_user_qa',
    password: 'SportCoreQA2026*',
    database: 'sportcoreos_db_qa',
  });

  const appClient = await appPool.connect();

  const schemaPath = '/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/SportCoreOS-api/src/database/schema.sql';
  const seedPath = '/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/SportCoreOS-api/src/database/seed.sql';

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await appClient.query(schemaSql);
  console.log('✅ Esquema DDL Modular aplicado con éxito en PostgreSQL QA.');

  const seedSql = fs.readFileSync(seedPath, 'utf8');
  await appClient.query(seedSql);
  console.log('✅ Datos Semilla aplicados con éxito en los Schemas Modulares.');

  // 3. Auditoría por Schemas
  const tables = [
    { schema: 'core', table: 'clubes' },
    { schema: 'core', table: 'usuarios' },
    { schema: 'core', table: 'membresias_club' },
    { schema: 'deportivo', table: 'categorias' },
    { schema: 'deportivo', table: 'jugadores' },
    { schema: 'deportivo', table: 'acudientes' },
    { schema: 'deportivo', table: 'jugador_acudientes' },
    { schema: 'competicion', table: 'partidos' },
    { schema: 'competicion', table: 'convocatorias' },
    { schema: 'rendimiento', table: 'evaluaciones_biometricas' },
    { schema: 'finanzas', table: 'conceptos' },
    { schema: 'finanzas', table: 'cargos_jugador' },
  ];

  console.log('\n📊 AUDITORÍA DE REGISTROS POR SCHEMA:');
  for (const t of tables) {
    const res = await appClient.query(`SELECT COUNT(*) FROM ${t.schema}.${t.table};`);
    console.log(`- [${t.schema}.${t.table}]: ${res.rows[0].count} registros`);
  }

  appClient.release();
  await appPool.end();
}

migrateModularSchemas().catch(err => {
  console.error('❌ Error en migración modular:', err);
  process.exit(1);
});
