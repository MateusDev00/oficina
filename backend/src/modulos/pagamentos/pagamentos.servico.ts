import { Request, Response } from 'express';
import { query } from '../../configuracao/base_de_dados';

class PagamentosServico {
  async listar(_req: Request, res: Response): Promise<void> {
    const result = await query(
      `SELECT p.*, o.descricao as ordem_descricao, u.nome as cliente_nome
       FROM pagamentos p
       JOIN ordens_servico o ON p.ordem_servico_id = o.id
       JOIN utilizadores u ON o.cliente_id = u.id
       ORDER BY p.criado_em DESC`
    );
    res.json(result.rows);
  }

  async obterPorId(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, o.descricao, o.estado as ordem_estado
       FROM pagamentos p
       JOIN ordens_servico o ON p.ordem_servico_id = o.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ mensagem: 'Pagamento não encontrado' });
      return;
    }
    res.json(result.rows[0]);
  }
}

export default new PagamentosServico();