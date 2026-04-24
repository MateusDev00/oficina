import cron from 'node-cron';
import { query } from '../../configuracao/base_de_dados';
import { emitirEvento } from '../eventos/emissor_de_eventos';
import redis from '../../configuracao/redis';

export function iniciarVerificacaoOrdensAtrasadas(): void {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Tarefa] Verificando ordens atrasadas...');
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const result = await query(
        `SELECT id, cliente_id, data_agendada
         FROM ordens_servico
         WHERE data_agendada < $1
           AND estado NOT IN ('concluida', 'cancelada')
           AND data_agendada IS NOT NULL`,
        [hoje]
      );

      for (const ordem of result.rows) {
        const diasAtraso = Math.floor(
          (Date.now() - new Date(ordem.data_agendada).getTime()) / 86400000
        );
        await emitirEvento('ORDEM_ATRASADA', {
          ordem_id: ordem.id,
          cliente_id: ordem.cliente_id,
          dias_atraso: diasAtraso,
        });
      }
    } catch (erro) {
      console.error('Erro na verificação de ordens atrasadas:', erro);
    }
  });
}

export function iniciarLimpezaCache(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      const chaves = await redis.keys('temp:*');
      for (const chave of chaves) {
        const ttl = await redis.ttl(chave);
        if (ttl === -1) {
          await redis.del(chave);
        }
      }
    } catch (erro) {
      console.error('Erro na limpeza de cache:', erro);
    }
  });
}

export function iniciarTodasTarefas(): void {
  iniciarVerificacaoOrdensAtrasadas();
  iniciarLimpezaCache();
  console.log('Tarefas agendadas iniciadas.');
}