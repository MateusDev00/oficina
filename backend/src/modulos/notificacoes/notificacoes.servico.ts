import { Request, Response } from 'express';
import { query } from '../../configuracao/base_de_dados';
import { RequestAutenticado } from '../../intermediarios/autenticacao';

class NotificacoesServico {
  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    const utilizador = req.utilizador!;
    const result = await query(
      `SELECT * FROM notificacoes WHERE utilizador_id = $1 ORDER BY criado_em DESC`,
      [utilizador.id]
    );
    res.json(result.rows);
  }

  async reenviar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await query(
      `UPDATE notificacoes SET estado = 'pendente', enviado_em = NULL, atualizado_em = NOW() WHERE id = $1`,
      [id]
    );
    res.json({ mensagem: 'Notificação será reenviada' });
  }
}

export default new NotificacoesServico();