import { Client } from 'pg';

async function introspectJugadores() {
  const client = new Client({
    connectionString: 'postgresql://sportcore_user_qa:SportCoreQA2026*@100.120.112.79:52132/sportcoreos_db_qa',
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'jugadores'
    ORDER BY ordinal_position;
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

introspectJugadores();
