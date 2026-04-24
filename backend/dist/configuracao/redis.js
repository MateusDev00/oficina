"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidarCache = exports.definirCache = exports.obterCache = exports.testarConexaoRedis = void 0;
const redis_1 = require("@upstash/redis");
const ambiente_1 = require("./ambiente");
let redis;
if (ambiente_1.UPSTASH_REDIS_REST_URL && ambiente_1.UPSTASH_REDIS_REST_TOKEN) {
    redis = new redis_1.Redis({
        url: ambiente_1.UPSTASH_REDIS_REST_URL,
        token: ambiente_1.UPSTASH_REDIS_REST_TOKEN,
    });
}
else {
    console.warn('⚠️ Upstash Redis não configurado. Funcionalidades de cache/eventos estarão desativadas.');
    // Cria um cliente fictício para evitar erros de runtime (os métodos vão falhar silenciosamente)
    redis = new redis_1.Redis({ url: '', token: '' });
}
/**
 * Testa a conexão com o Redis (Upstash)
 */
const testarConexaoRedis = async () => {
    try {
        await redis.ping();
        return true;
    }
    catch {
        return false;
    }
};
exports.testarConexaoRedis = testarConexaoRedis;
/**
 * Obtém um valor do cache
 */
const obterCache = async (chave) => {
    try {
        return await redis.get(chave);
    }
    catch {
        return null;
    }
};
exports.obterCache = obterCache;
/**
 * Define um valor no cache com expiração opcional
 */
const definirCache = async (chave, valor, expiracaoEmSegundos) => {
    try {
        if (expiracaoEmSegundos) {
            await redis.setex(chave, expiracaoEmSegundos, valor);
        }
        else {
            await redis.set(chave, valor);
        }
    }
    catch {
        // falha silenciosa
    }
};
exports.definirCache = definirCache;
/**
 * Invalida chaves que correspondem a um padrão (cuidado: pode ser pesado)
 */
const invalidarCache = async (padrao) => {
    try {
        const chaves = await redis.keys(padrao);
        if (chaves.length > 0) {
            // Upstash suporta pipeline para múltiplos comandos
            const pipeline = redis.pipeline();
            chaves.forEach((chave) => pipeline.del(chave));
            await pipeline.exec();
        }
    }
    catch {
        // falha silenciosa
    }
};
exports.invalidarCache = invalidarCache;
// Exporta o cliente para uso em publicações/assinaturas (eventos)
exports.default = redis;
//# sourceMappingURL=redis.js.map