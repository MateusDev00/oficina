import { Pool, PoolClient, QueryResult } from 'pg';
import { DATABASE_URL, NODE_ENV } from './ambiente';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,                       // Reduzido para evitar esgotar o pooler
  idleTimeoutMillis: 10000,     // Liberta conexões paradas após 10 segundos
  connectionTimeoutMillis: 8000, // 8 segundos para estabelecer ligação
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000, // Mantém a ligação viva com pings
});

pool.on('error', (err) => {
  console.error('Erro no pool PostgreSQL do trabalhador:', err.message);
});

pool.on('connect', () => {
  console.log('Nova conexão PostgreSQL estabelecida no trabalhador.');
});

export const query = async (texto: string, parametros?: any[]): Promise<QueryResult> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
    try {
      return await pool.query(texto, parametros);
    } catch (erro: any) {
      lastError = erro;
      if (erro.code === 'ECONNRESET' || erro.message?.includes('timeout')) {
        console.warn(`Tentativa ${tentativa}/${maxRetries} falhou. Retentando em ${tentativa * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, tentativa * 1000));
        continue;
      }
      throw erro;
    }
  }
  throw lastError || new Error('Todas as tentativas de query falharam');
};

export const getCliente = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export default pool;