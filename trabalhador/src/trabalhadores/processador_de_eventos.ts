import { query } from '../configuracao/base_de_dados';
import redis from '../configuracao/redis';
import { processarEventoNoAgente } from '../agente/cliente_do_agente';

async function emitirEventoLocal(tipo: string, payload: any): Promise<void> {
  try {
    await query(
      `INSERT INTO eventos (tipo, payload, processado) VALUES ($1, $2, FALSE)`,
      [tipo, JSON.stringify(payload)]
    );
  } catch (erro: any) {
    console.error('Erro ao emitir evento local:', erro.message);
  }
}

async function executarAcao(acao: { tipo: string; parametros: any }): Promise<void> {
  try {
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
  } catch (erro: any) {
    console.error(`Erro ao executar ação ${acao.tipo}:`, erro.message);
    // Não relançar - permite que o processador continue com outros eventos
  }
}

export async function executarProcessador(): Promise<void> {
  try {
    // Buscar eventos não processados com até 3 tentativas
    const result = await query(
      `SELECT id, tipo, payload, tentativas
       FROM eventos
       WHERE processado = FALSE AND tentativas < 3
       ORDER BY criado_em ASC
       LIMIT 10`
    );

    if (result.rows.length === 0) return;

    for (const row of result.rows) {
      const evento = row;
      try {
        console.log(`Processando evento ${evento.id} (${evento.tipo})`);

        // Tentar processar via agente
        let decisao;
        try {
          decisao = await processarEventoNoAgente({
            id: evento.id,
            tipo: evento.tipo,
            payload: evento.payload,
          });
        } catch (agenteErro: any) {
          console.warn(`Agente indisponível para evento ${evento.id}: ${agenteErro.message}`);
          // Se o agente falhar, aplicar regras duras localmente
          decisao = await aplicarRegrasDuras(evento.tipo, evento.payload);
        }

        if (decisao?.acoes?.length) {
          for (const acao of decisao.acoes) {
            await executarAcao(acao);
          }
        }

        // Marcar como processado
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
  } catch (erro: any) {
    if (erro.code === 'ECONNRESET' || erro.message?.includes('timeout')) {
      console.warn('Conexão com PostgreSQL perdida temporariamente. Nova tentativa em breve.');
    } else {
      console.error('Erro no processador de eventos:', erro.message);
    }
  }
}

// Regras duras locais (quando o agente não está disponível)
async function aplicarRegrasDuras(tipo: string, payload: any): Promise<{ acoes: any[] }> {
  const acoes: any[] = [];
  
  if (tipo === 'ORDEM_ATRASADA' && payload.dias_atraso > 2) {
    acoes.push({ tipo: 'priorizar_ordem', parametros: { ordem_id: payload.ordem_id, nova_prioridade: 'alta' } });
    acoes.push({ tipo: 'notificar_cliente', parametros: { cliente_id: payload.cliente_id, mensagem: 'A sua ordem está atrasada e foi priorizada.' } });
  }
  
  if (tipo === 'TECNICO_INDISPONIVEL') {
    acoes.push({ tipo: 'realocar_ordens', parametros: { tecnico_id: payload.tecnico_id } });
  }
  
  return { acoes };
}