"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENTE_SECRET_KEY = exports.AGENTE_SERVICE_URL = exports.SUPABASE_SERVICE_ROLE_KEY = exports.SUPABASE_URL = exports.UPSTASH_REDIS_REST_TOKEN = exports.UPSTASH_REDIS_REST_URL = exports.DATABASE_URL = exports.NODE_ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.NODE_ENV = process.env.NODE_ENV || 'desenvolvimento';
exports.DATABASE_URL = process.env.DATABASE_URL || '';
// Upstash Redis
exports.UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
exports.UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
// Supabase (para acesso administrativo se necessário)
exports.SUPABASE_URL = process.env.SUPABASE_URL || 'https://blybkuqvqykssllsxir.supabase.co';
exports.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// Agente
exports.AGENTE_SERVICE_URL = process.env.AGENTE_SERVICE_URL || 'http://localhost:8000';
exports.AGENTE_SECRET_KEY = process.env.AGENTE_SECRET_KEY || 'chave-secreta-compartilhada';
