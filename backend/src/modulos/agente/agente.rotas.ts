// backend/src/modulos/agente/agente.rotas.ts
import { Router, Request, Response } from 'express';
import { autenticar } from '../../intermediarios/autenticacao';
import clienteDoAgente from '../../nucleo/agente/cliente_do_agente';

const router = Router();

/**
 * POST /conversa
 * Processa uma mensagem enviada pelo cliente através do chat.
 * Requer autenticação. O token JWT deve ser enviado no cabeçalho Authorization.
 */
router.post(
  '/conversa',
  autenticar,
  async (req: Request, res: Response): Promise<void> => {
    const { mensagem, contexto_usuario } = req.body;

    if (!mensagem || typeof mensagem !== 'string' || mensagem.trim().length === 0) {
      res.status(400).json({ mensagem: 'O campo "mensagem" é obrigatório e deve ser uma string não vazia.' });
      return;
    }

    try {
      const resposta = await clienteDoAgente.processarMensagem(
        mensagem.trim(),
        contexto_usuario || {}
      );
      res.json(resposta);
    } catch (erro: any) {
      console.error(`[Agente] Erro na conversa: ${erro.message}`);
      res.status(502).json({
        mensagem: 'O assistente virtual está temporariamente indisponível. Tente novamente mais tarde.',
      });
    }
  }
);

export default router;