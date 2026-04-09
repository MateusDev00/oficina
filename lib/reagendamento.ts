// lib/reagendamento.ts
import { query } from './db';

export async function reagendarOrdemServico(
  ordemId: number,
  motivo: string = 'cliente_ausente'
): Promise<Date | null> {
  // 1. Obter a OS original
  const osRes = await query(
    `SELECT tecnico_id, cliente_id, descricao, data_agendada
     FROM ordens_servico
     WHERE id = $1`,
    [ordemId]
  );
  if (osRes.rows.length === 0) return null;
  const os = osRes.rows[0];
  const tecnicoId = os.tecnico_id;
  const dataOriginal = os.data_agendada;

  // 2. Liberar a data atual do técnico
  await query(
    `INSERT INTO disponibilidade_tecnico (tecnico_id, data, disponivel)
     VALUES ($1, $2, true)
     ON CONFLICT (tecnico_id, data) DO UPDATE SET disponivel = true`,
    [tecnicoId, dataOriginal]
  );

  // 3. Procurar próximo dia disponível após hoje
  const hoje = new Date().toISOString().slice(0, 10);
  const disponiveis = await query(
    `SELECT dt.data
     FROM disponibilidade_tecnico dt
     WHERE dt.tecnico_id = $1
       AND dt.data > $2
       AND dt.disponivel = true
     ORDER BY dt.data ASC
     LIMIT 1`,
    [tecnicoId, hoje]
  );

  let novaData: Date | null = null;
  if (disponiveis.rows.length > 0) {
    novaData = disponiveis.rows[0].data;
  } else {
    // Se não há disponibilidade pré-definida, encontrar o primeiro dia sem agendamento
    const proximo = await query(
      `SELECT generate_series($1::date + 1, $1::date + 30, '1 day')::date AS dia
       WHERE NOT EXISTS (
         SELECT 1 FROM ordens_servico WHERE tecnico_id = $2 AND data_agendada = generate_series
       )
       LIMIT 1`,
      [hoje, tecnicoId]
    );
    if (proximo.rows.length > 0) {
      novaData = proximo.rows[0].dia;
    }
  }

  if (!novaData) return null;

  // 4. Atualizar a OS com a nova data
  await query(
    `UPDATE ordens_servico
     SET data_agendada = $1,
         estado = 'pendente',
         atualizado_em = NOW()
     WHERE id = $2`,
    [novaData, ordemId]
  );

  // 5. Marcar técnico como ocupado na nova data
  await query(
    `INSERT INTO disponibilidade_tecnico (tecnico_id, data, disponivel)
     VALUES ($1, $2, false)
     ON CONFLICT (tecnico_id, data) DO UPDATE SET disponivel = false`,
    [tecnicoId, novaData]
  );

  // 6. Registrar reagendamento
  await query(
    `INSERT INTO reagendamentos_auto (ordem_servico_id, data_original, data_reagendada, motivo)
     VALUES ($1, $2, $3, $4)`,
    [ordemId, dataOriginal, novaData, motivo]
  );

  return novaData;
}