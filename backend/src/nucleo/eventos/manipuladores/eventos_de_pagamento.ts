import { query } from '../../../configuracao/base_de_dados';
import redis from '../../../configuracao/redis';
import { emitirEvento } from '../emissor_de_eventos';
import { EventoPayload } from '../../../tipos/eventos';

export async function manipularPagamentoConfirmado(payload: EventoPayload): Promise<void> {
  const { ordem_id } = payload;
  if (!ordem_id) return;

  await query(
    `UPDATE ordens_servico SET estado_pagamento = 'pago', atualizado_em = NOW() WHERE id = $1`,
    [ordem_id]
  );

  await redis.del(`ordem:${ordem_id}`);

  const ordem = await query(
    `SELECT cliente_id FROM ordens_servico WHERE id = $1`,
    [ordem_id]
  );
  if (ordem.rows.length > 0) {
    await emitirEvento('CLIENTE_NOTIFICADO', {
      cliente_id: ordem.rows[0].cliente_id,
      ordem_id,
      tipo_notificacao: 'pagamento_confirmado',
    });
  }
}