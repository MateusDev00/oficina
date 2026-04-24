import { emitirEvento } from '../emissor_de_eventos';
import { query } from '../../../configuracao/base_de_dados';
import redis from '../../../configuracao/redis';
import { EventoPayload } from '../../../tipos/eventos';

export async function manipularOrdemCriada(payload: EventoPayload): Promise<void> {
  const { ordem_id, cliente_id } = payload;
  if (!ordem_id || !cliente_id) return;

  await redis.del(`cliente:${cliente_id}:ordens`);

  await emitirEvento('CLIENTE_NOTIFICADO', {
    cliente_id,
    ordem_id,
    tipo_notificacao: 'confirmacao_agendamento',
  });
}

export async function manipularOrdemAtrasada(payload: EventoPayload): Promise<void> {
  const { ordem_id, cliente_id, dias_atraso } = payload;
  if (!ordem_id || !cliente_id) return;

  await query(
    `INSERT INTO logs_auditoria (utilizador_id, acao, entidade, entidade_id, detalhes)
     VALUES ($1, $2, $3, $4, $5)`,
    [cliente_id, 'ORDEM_ATRASADA_DETECTADA', 'ordens_servico', ordem_id, { dias_atraso }]
  );
}

export async function manipularOrdemConcluida(payload: EventoPayload): Promise<void> {
  const { ordem_id, cliente_id } = payload;
  if (!ordem_id) return;

  if (cliente_id) {
    await redis.del(`cliente:${cliente_id}:ordens`);
    await emitirEvento('CLIENTE_NOTIFICADO', {
      cliente_id,
      ordem_id,
      tipo_notificacao: 'ordem_concluida',
    });
  }
}