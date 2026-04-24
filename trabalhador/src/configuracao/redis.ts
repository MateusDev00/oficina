import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from './ambiente';

let redis: Redis;

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('⚠️ Upstash Redis não configurado no trabalhador.');
  redis = new Redis({ url: '', token: '' });
}

export const testarConexaoRedis = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
};

export default redis;