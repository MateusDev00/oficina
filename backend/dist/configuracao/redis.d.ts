import { Redis } from '@upstash/redis';
declare let redis: Redis;
/**
 * Testa a conexão com o Redis (Upstash)
 */
export declare const testarConexaoRedis: () => Promise<boolean>;
/**
 * Obtém um valor do cache
 */
export declare const obterCache: <T = any>(chave: string) => Promise<T | null>;
/**
 * Define um valor no cache com expiração opcional
 */
export declare const definirCache: (chave: string, valor: any, expiracaoEmSegundos?: number) => Promise<void>;
/**
 * Invalida chaves que correspondem a um padrão (cuidado: pode ser pesado)
 */
export declare const invalidarCache: (padrao: string) => Promise<void>;
export default redis;
//# sourceMappingURL=redis.d.ts.map