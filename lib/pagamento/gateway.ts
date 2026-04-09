/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/pagamento/gateway.ts
import { query } from '../db';

export interface SolicitacaoPagamento {
  valor: number;
  descricao: string;
  usuarioId: number;
  ordemServicoId?: number;
}

export interface RespostaPagamento {
  sucesso: boolean;
  idTransacao?: string;
  erro?: string;
}

export async function criarPagamento(solicitacao: SolicitacaoPagamento): Promise<RespostaPagamento> {
  const { valor, descricao, usuarioId, ordemServicoId } = solicitacao;

  if (valor <= 0) {
    return { sucesso: false, erro: 'Valor inválido.' };
  }

  try {
    const resultado = await query(
      `INSERT INTO pagamentos (utilizador_id, ordem_servico_id, valor, metodo, estado, referencia_gateway)
       VALUES ($1, $2, $3, 'simulado', 'pendente', $4)
       RETURNING id`,
      [usuarioId, ordemServicoId || null, valor, `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`]
    );
    const idTransacao = resultado.rows[0].id;

    // Simula a confirmação do pagamento após 5 segundos (webhook simulado)
    setTimeout(async () => {
      await query(
        `UPDATE pagamentos SET estado = 'pago', atualizado_em = NOW() WHERE id = $1`,
        [idTransacao]
      );
      console.log(`[Webhook Simulado] Pagamento ${idTransacao} confirmado.`);
    }, 5000);

    return {
      sucesso: true,
      idTransacao: idTransacao.toString(),
    };
  } catch (erro) {
    console.error('Erro ao criar pagamento simulado:', erro);
    return { sucesso: false, erro: 'Erro interno ao criar pagamento.' };
  }
}