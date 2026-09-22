import { Client } from 'pg';

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = new Client({
    host: process.env['DB_HOST'] || '100.120.112.79',
    port: parseInt(process.env['DB_PORT'] || '52132', 10),
    user: process.env['DB_USER'] || 'sportcore_user_qa',
    password: process.env['DB_PASSWORD'] || 'SportCoreQA2026*',
    database: process.env['DB_NAME'] || 'sportcoreos_db_qa',
  });

  try {
    await client.connect();
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    await client.end();
  }
}
