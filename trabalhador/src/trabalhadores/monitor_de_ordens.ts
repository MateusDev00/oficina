import { query } from '../configuracao/base_de_dados';

async function emitirEventoLocal(tipo: string, payload: unknown): Promise<void> {
  await query(
    `INSERT INTO eventos (tipo, payload, processado) VALUES ($1, $2, FALSE)`,
    [tipo, JSON.stringify(payload)]
  );
}

export async function verificarOrdensAtrasadas(): Promise<void> {
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
        (Date.now() - new Date(ordem.data_agendada).getTime()) / 86_400_000
      );
      await emitirEventoLocal('ORDEM_ATRASADA', {
        ordem_id: ordem.id,
        cliente_id: ordem.cliente_id,
        dias_atraso: diasAtraso,
      });
    }

    console.log(`Monitor de ordens: ${result.rows.length} ordens atrasadas detetadas.`);
  } catch (erro) {
    console.error('Erro no monitor de ordens:', erro);
  }
}