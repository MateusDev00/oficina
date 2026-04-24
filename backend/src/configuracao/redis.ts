import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from './ambiente';

let redis: Redis;

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('⚠️ Upstash Redis não configurado. Funcionalidades de cache/eventos estarão desativadas.');
  // Cria um cliente fictício para evitar erros de runtime (os métodos vão falhar silenciosamente)
  redis = new Redis({ url: '', token: '' });
}

/**
 * Testa a conexão com o Redis (Upstash)
 */
export const testarConexaoRedis = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtém um valor do cache
 */
export const obterCache = async <T = any>(chave: string): Promise<T | null> => {
  try {
    return await redis.get<T>(chave);
  } catch {
    return null;
  }
};

/**
 * Define um valor no cache com expiração opcional
 */
export const definirCache = async (
  chave: string,
  valor: any,
  expiracaoEmSegundos?: number
): Promise<void> => {
  try {
    if (expiracaoEmSegundos) {
      await redis.setex(chave, expiracaoEmSegundos, valor);
    } else {
      await redis.set(chave, valor);
    }
  } catch {
    // falha silenciosa
  }
};

/**
 * Invalida chaves que correspondem a um padrão (cuidado: pode ser pesado)
 */
export const invalidarCache = async (padrao: string): Promise<void> => {
  try {
    const chaves = await redis.keys(padrao);
    if (chaves.length > 0) {
      // Upstash suporta pipeline para múltiplos comandos
      const pipeline = redis.pipeline();
      chaves.forEach((chave) => pipeline.del(chave));
      await pipeline.exec();
    }
  } catch {
    // falha silenciosa
  }
};

// Exporta o cliente para uso em publicações/assinaturas (eventos)
export default redis;