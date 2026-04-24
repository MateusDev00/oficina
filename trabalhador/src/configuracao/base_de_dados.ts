import { Pool, PoolClient, QueryResult } from 'pg';
import { DATABASE_URL, NODE_ENV } from './ambiente';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'producao' ? { rejectUnauthorized: false } : false,
  max: 5, // menor que o backend, pois trabalhador é processo único
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erro no pool PostgreSQL do trabalhador:', err);
});

export const query = async (texto: string, parametros?: any[]): Promise<QueryResult> => {
  return pool.query(texto, parametros);
};

export const getCliente = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export default pool;