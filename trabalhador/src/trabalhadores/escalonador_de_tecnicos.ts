import { query } from '../configuracao/base_de_dados';

export async function otimizarAlocacoes(): Promise<void> {
  try {
    const ordensResult = await query(
      `SELECT id FROM ordens_servico 
       WHERE tecnico_id IS NULL AND estado = 'pendente'
       ORDER BY 
         CASE prioridade WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
         data_agendada ASC NULLS LAST`
    );

    const tecnicosResult = await query(
      `SELECT u.id, COUNT(o.id) as carga
       FROM utilizadores u
       LEFT JOIN ordens_servico o ON u.id = o.tecnico_id AND o.estado IN ('pendente', 'em_andamento')
       WHERE u.papel = 'tecnico' AND u.disponivel = true
       GROUP BY u.id
       ORDER BY carga ASC`
    );

    if (tecnicosResult.rows.length === 0) {
      console.log('Nenhum técnico disponível para alocação.');
      return;
    }

    let idx = 0;
    for (const ordem of ordensResult.rows) {
      const tecnico = tecnicosResult.rows[idx % tecnicosResult.rows.length];
      await query(`UPDATE ordens_servico SET tecnico_id = $1 WHERE id = $2`, [tecnico.id, ordem.id]);
      console.log(`Ordem ${ordem.id} atribuída ao técnico ${tecnico.id}`);
      idx++;
    }
  } catch (erro) {
    console.error('Erro no escalonador de técnicos:', erro);
  }
}