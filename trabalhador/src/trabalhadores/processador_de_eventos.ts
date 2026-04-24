import { query } from '../configuracao/base_de_dados';
import { processarEventoNoAgente } from '../agente/cliente_do_agente';
import { Evento } from '../tipos';

async function executarAcao(acao: { tipo: string; parametros: any }): Promise<void> {
  switch (acao.tipo) {
    case 'notificar_cliente':
      await query(
        `INSERT INTO notificacoes (utilizador_id, canal, conteudo, estado)
         VALUES ($1, $2, $3, 'pendente')`,
        [acao.parametros.cliente_id, acao.parametros.canal || 'whatsapp', acao.parametros.mensagem]
      );
      break;
    case 'reagendar_ordem':
      await query(
        `INSERT INTO reagendamentos_auto (ordem_servico_id, data_original, data_reagendada, motivo)
         SELECT $1, data_agendada, $2, $3 FROM ordens_servico WHERE id = $1`,
        [acao.parametros.ordem_id, acao.parametros.nova_data, acao.parametros.motivo]
      );
      await query(`UPDATE ordens_servico SET data_agendada = $1 WHERE id = $2`, [
        acao.parametros.nova_data,
        acao.parametros.ordem_id,
      ]);
      break;
    case 'priorizar_ordem':
      await query(`UPDATE ordens_servico SET prioridade = $1 WHERE id = $2`, [
        acao.parametros.nova_prioridade,
        acao.parametros.ordem_id,
      ]);
      break;
    case 'sugerir_tecnico':
      await query(`UPDATE ordens_servico SET tecnico_id = $1 WHERE id = $2`, [
        acao.parametros.tecnico_id,
        acao.parametros.ordem_id,
      ]);
      break;
    default:
      console.warn(`Ação desconhecida ignorada: ${acao.tipo}`);
  }
}

export async function executarProcessador(): Promise<void> {
  try {
    const result = await query(
      `SELECT id, tipo, payload, tentativas
       FROM eventos
       WHERE processado = FALSE AND tentativas < 3
       ORDER BY criado_em ASC
       LIMIT 10`
    );

    for (const row of result.rows) {
      const evento = row as Evento;
      try {
        console.log(`Processando evento ${evento.id} (${evento.tipo})`);

        const decisao = await processarEventoNoAgente({
          id: evento.id,
          tipo: evento.tipo,
          payload: evento.payload,
        });

        if (decisao.acoes && decisao.acoes.length > 0) {
          for (const acao of decisao.acoes) {
            await executarAcao(acao);
          }
        }

        await query(`UPDATE eventos SET processado = TRUE, processado_em = NOW() WHERE id = $1`, [evento.id]);
        console.log(`Evento ${evento.id} processado com sucesso`);
      } catch (erro: any) {
        console.error(`Falha no evento ${evento.id}:`, erro.message);
        await query(
          `UPDATE eventos SET tentativas = tentativas + 1, ultimo_erro = $2 WHERE id = $1`,
          [evento.id, erro.message]
        );
      }
    }
  } catch (erro) {
    console.error('Erro no processador de eventos:', erro);
  }
}