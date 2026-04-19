// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                // máximo de conexões simultâneas
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão fica ociosa (30s)
  connectionTimeoutMillis: 5000, // timeout para estabelecer conexão (5s)
  keepAlive: true,        // mantém a conexão ativa com keepalive TCP
  keepAliveInitialDelayMillis: 10000, // inicia keepalive após 10s
});

// Eventos de log para debug
pool.on('error', (err, client) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export async function getClient() {
  return await pool.connect();
}

export default pool;