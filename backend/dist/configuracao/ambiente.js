"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_ORIGINS = exports.RATE_LIMIT_MAX = exports.RATE_LIMIT_WINDOW_MS = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.AGENTE_SECRET_KEY = exports.AGENTE_SERVICE_URL = exports.SUPABASE_SERVICE_ROLE_KEY = exports.SUPABASE_URL = exports.UPSTASH_REDIS_REST_TOKEN = exports.UPSTASH_REDIS_REST_URL = exports.DATABASE_URL = exports.PORTA = exports.NODE_ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Ajuste o caminho para o seu .env (está na raiz do backend)
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.NODE_ENV = process.env.NODE_ENV || 'desenvolvimento';
exports.PORTA = parseInt(process.env.PORTA || '4000', 10);
// PostgreSQL (Supabase)
exports.DATABASE_URL = process.env.DATABASE_URL || '';
// Redis (Upstash via REST)
exports.UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
exports.UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
// Supabase API
exports.SUPABASE_URL = process.env.SUPABASE_URL || 'https://blybkuqvqykssllsxir.supabase.co';
exports.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Agente Python
exports.AGENTE_SERVICE_URL = process.env.AGENTE_SERVICE_URL || 'http://localhost:8000';
exports.AGENTE_SECRET_KEY = process.env.AGENTE_SECRET_KEY || 'chave-secreta-compartilhada';
// JWT (⚠️ ADICIONE JWT_SECRET ao seu .env)
exports.JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-para-desenvolvimento-apenas';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// Rate Limit
exports.RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
exports.RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
// CORS
exports.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
];
// Validação em produção (não precisa de REDIS_URL)
if (exports.NODE_ENV === 'producao') {
    if (!exports.DATABASE_URL)
        throw new Error('DATABASE_URL é obrigatória');
    if (!exports.UPSTASH_REDIS_REST_URL || !exports.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Credenciais do Upstash Redis são obrigatórias em produção');
    }
    if (exports.JWT_SECRET === 'chave-secreta-para-desenvolvimento-apenas') {
        throw new Error('JWT_SECRET deve ser alterada em produção');
    }
}
//# sourceMappingURL=ambiente.js.map