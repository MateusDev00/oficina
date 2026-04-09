/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Opcional: adicionar SSL para produção
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

// Função para obter um cliente (conexão) da pool, usada em transações
export async function getClient() {
  return await pool.connect();
}

export default pool;