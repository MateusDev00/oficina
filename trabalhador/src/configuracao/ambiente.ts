import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const NODE_ENV = process.env.NODE_ENV || 'desenvolvimento';
export const DATABASE_URL = process.env.DATABASE_URL || '';

// Upstash Redis
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Supabase (para acesso administrativo se necessário)
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://blybkuqvqykssllsxir.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Agente
export const AGENTE_SERVICE_URL = process.env.AGENTE_SERVICE_URL || 'http://localhost:8000';
export const AGENTE_SECRET_KEY = process.env.AGENTE_SECRET_KEY || 'chave-secreta-compartilhada';