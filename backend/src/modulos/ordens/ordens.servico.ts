import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { query, getCliente } from '../../configuracao/base_de_dados';
import { emitirEvento } from '../../nucleo/eventos/emissor_de_eventos';
import { RequestAutenticado } from '../../intermediarios/autenticacao';
import redis from '../../configuracao/redis';

class OrdensServico {
  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    const utilizador = req.utilizador!;
    let sql = `
      SELECT o.*, u.nome as cliente_nome, v.matricula, v.marca, v.modelo,
             t.nome as tecnico_nome
      FROM ordens_servico o
      JOIN utilizadores u ON o.cliente_id = u.id
      JOIN veiculos v ON o.veiculo_id = v.id
      LEFT JOIN utilizadores t ON o.tecnico_id = t.id
    `;
    const params: any[] = [];

    if (utilizador.papel === 'cliente') {
      sql += ' WHERE o.cliente_id = $1';
      params.push(utilizador.id);
    } else if (utilizador.papel === 'tecnico') {
      sql += ' WHERE o.tecnico_id = $1 OR o.tecnico_id IS NULL';
      params.push(utilizador.id);
    }

    sql += ' ORDER BY o.criado_em DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  }

  async obterPorId(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await query(
      `SELECT o.*, 
              COALESCE(json_agg(DISTINCT os.*) FILTER (WHERE os.id IS NOT NULL), '[]') as servicos,
              COALESCE(json_agg(DISTINCT op.*) FILTER (WHERE op.id IS NOT NULL), '[]') as pecas
       FROM ordens_servico o
       LEFT JOIN ordem_servicos os ON o.id = os.ordem_servico_id
       LEFT JOIN ordem_pecas op ON o.id = op.ordem_servico_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ mensagem: 'Ordem não encontrada' });
      return;
    }
    res.json(result.rows[0]);
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    const { cliente_id, veiculo_id, descricao, data_agendada, prioridade, servicos_ids, pecas } = req.body;
    const cliente = await getCliente();

    try {
      await cliente.query('BEGIN');

      const ordemResult = await cliente.query(
        `INSERT INTO ordens_servico (cliente_id, veiculo_id, descricao, data_agendada, prioridade, estado)
         VALUES ($1, $2, $3, $4, $5, 'pendente')
         RETURNING *`,
        [cliente_id, veiculo_id, descricao, data_agendada || null, prioridade || 'media']
      );
      const ordem = ordemResult.rows[0];

      if (servicos_ids && servicos_ids.length > 0) {
        for (const servicoId of servicos_ids) {
          await cliente.query(
            `INSERT INTO ordem_servicos (ordem_servico_id, servico_id, quantidade, preco_unitario)
             SELECT $1, $2, 1, preco_base FROM servicos WHERE id = $2`,
            [ordem.id, servicoId]
          );
        }
      }

      if (pecas && pecas.length > 0) {
        for (const peca of pecas) {
          const pecaInfo = await cliente.query('SELECT preco_unitario FROM pecas WHERE id = $1', [peca.peca_id]);
          if (pecaInfo.rows.length === 0) continue;
          await cliente.query(
            `INSERT INTO ordem_pecas (ordem_servico_id, peca_id, quantidade, preco_unitario)
             VALUES ($1, $2, $3, $4)`,
            [ordem.id, peca.peca_id, peca.quantidade, pecaInfo.rows[0].preco_unitario]
          );
        }
      }

      await cliente.query('COMMIT');

      await emitirEvento('ORDEM_CRIADA', {
        ordem_id: ordem.id,
        cliente_id,
        veiculo_id,
        data_agendada: ordem.data_agendada,
        prioridade: ordem.prioridade
      });

      await redis.del(`cliente:${cliente_id}:ordens`);
      res.status(201).json(ordem);
    } catch (erro) {
      await cliente.query('ROLLBACK');
      throw erro;
    } finally {
      cliente.release();
    }
  }

  async atualizarStatus(req: RequestAutenticado, res: Response): Promise<void> {
    const { id } = req.params;
    const { estado, resumo_diagnostico } = req.body;

    const ordemAnterior = await query('SELECT * FROM ordens_servico WHERE id = $1', [id]);
    if (ordemAnterior.rows.length === 0) {
      res.status(404).json({ mensagem: 'Ordem não encontrada' });
      return;
    }

    const updates: string[] = ['estado = $1', 'atualizado_em = NOW()'];
    const values: any[] = [estado];

    if (estado === 'em_andamento' && !ordemAnterior.rows[0].iniciado_em) {
      updates.push('iniciado_em = NOW()');
    }
    if (estado === 'concluida') {
      updates.push('concluido_em = NOW()');
    }
    if (resumo_diagnostico) {
      updates.push('resumo_diagnostico = $' + (values.length + 1));
      values.push(resumo_diagnostico);
    }
    values.push(id);

    await query(
      `UPDATE ordens_servico SET ${updates.join(', ')} WHERE id = $${values.length}`,
      values
    );

    const ordemAtualizada = (await query('SELECT * FROM ordens_servico WHERE id = $1', [id])).rows[0];

    if (estado === 'concluida') {
      await emitirEvento('ORDEM_CONCLUIDA', {
        ordem_id: parseInt(id),
        cliente_id: ordemAtualizada.cliente_id,
        tecnico_id: ordemAtualizada.tecnico_id
      });
    }

    if (ordemAnterior.rows[0].data_agendada && new Date() > new Date(ordemAnterior.rows[0].data_agendada)) {
      const diasAtraso = Math.floor((Date.now() - new Date(ordemAnterior.rows[0].data_agendada).getTime()) / 86400000);
      await emitirEvento('ORDEM_ATRASADA', {
        ordem_id: parseInt(id),
        dias_atraso: diasAtraso,
        cliente_id: ordemAtualizada.cliente_id
      });
    }

    await redis.del(`ordem:${id}`);
    res.json(ordemAtualizada);
  }

  async atribuirTecnico(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { tecnico_id } = req.body;
    await query(
      'UPDATE ordens_servico SET tecnico_id = $1, atualizado_em = NOW() WHERE id = $2',
      [tecnico_id, id]
    );
    res.json({ mensagem: 'Técnico atribuído com sucesso' });
  }

  async registarPagamento(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { valor, metodo, referencia_gateway, id_transacao } = req.body;

    const result = await query(
      `INSERT INTO pagamentos (ordem_servico_id, valor, metodo, referencia_gateway, id_transacao, estado)
       VALUES ($1, $2, $3, $4, $5, 'concluido')
       RETURNING *`,
      [id, valor, metodo, referencia_gateway, id_transacao]
    );

    await query(
      'UPDATE ordens_servico SET estado_pagamento = $1, atualizado_em = NOW() WHERE id = $2',
      ['pago', id]
    );

    await emitirEvento('PAGAMENTO_CONFIRMADO', {
      ordem_id: parseInt(id),
      pagamento_id: result.rows[0].id,
      valor
    });

    res.json(result.rows[0]);
  }
}

export default new OrdensServico();