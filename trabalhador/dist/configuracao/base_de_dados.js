"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCliente = exports.query = void 0;
const pg_1 = require("pg");
const ambiente_1 = require("./ambiente");
const pool = new pg_1.Pool({
    connectionString: ambiente_1.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3, // Reduzido para evitar esgotar o pooler
    idleTimeoutMillis: 10000, // Liberta conexões paradas após 10 segundos
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
const query = async (texto, parametros) => {
    const maxRetries = 3;
    let lastError = null;
    for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
        try {
            return await pool.query(texto, parametros);
        }
        catch (erro) {
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
exports.query = query;
const getCliente = async () => {
    return await pool.connect();
};
exports.getCliente = getCliente;
exports.default = pool;
