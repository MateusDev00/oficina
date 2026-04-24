import dotenv from 'dotenv';
import path from 'path';

// Ajuste o caminho para o seu .env (está na raiz do backend)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const NODE_ENV = process.env.NODE_ENV || 'desenvolvimento';
export const PORTA = parseInt(process.env.PORTA || '4000', 10);

// PostgreSQL (Supabase)
export const DATABASE_URL = process.env.DATABASE_URL || '';

// Redis (Upstash via REST)
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Supabase API
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://blybkuqvqykssllsxir.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Agente Python
export const AGENTE_SERVICE_URL = process.env.AGENTE_SERVICE_URL || 'http://localhost:8000';
export const AGENTE_SECRET_KEY = process.env.AGENTE_SECRET_KEY || 'chave-secreta-compartilhada';

// JWT (⚠️ ADICIONE JWT_SECRET ao seu .env)
export const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-para-desenvolvimento-apenas';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Rate Limit
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

// CORS
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001'
];

// Validação em produção (não precisa de REDIS_URL)
if (NODE_ENV === 'producao') {
  if (!DATABASE_URL) throw new Error('DATABASE_URL é obrigatória');
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Credenciais do Upstash Redis são obrigatórias em produção');
  }
  if (JWT_SECRET === 'chave-secreta-para-desenvolvimento-apenas') {
    throw new Error('JWT_SECRET deve ser alterada em produção');
  }
}