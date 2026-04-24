import { Pool, PoolClient, QueryResult } from 'pg';
import { DATABASE_URL, NODE_ENV } from './ambiente';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'producao' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('Erro inesperado no cliente PostgreSQL', err);
  });
});

export const query = async (texto: string, parametros?: any[]): Promise<QueryResult> => {
  return pool.query(texto, parametros);
};

export const getCliente = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// NOVA FUNÇÃO ADICIONADA
export const testarConexao = async (): Promise<boolean> => {
  try {
    const resultado = await query('SELECT NOW() as agora');
    console.log('PostgreSQL: Conexão estabelecida em', resultado.rows[0].agora);
    return true;
  } catch (erro) {
    console.error('PostgreSQL: Falha na conexão:', (erro as Error).message);
    return false;
  }
};

export default pool;