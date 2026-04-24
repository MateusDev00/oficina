"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testarConexaoRedis = void 0;
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
    console.warn('⚠️ Upstash Redis não configurado no trabalhador.');
    redis = new redis_1.Redis({ url: '', token: '' });
}
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
exports.default = redis;
