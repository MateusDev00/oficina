import { Request, Response } from 'express';
import autenticacaoServico from './autenticacao.servico';
import { ErroPersonalizado } from '../../intermediarios/manipulador_de_erros';

class AutenticacaoControlador {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { telefone, senha } = req.body;
      const resultado = await autenticacaoServico.login(telefone, senha);
      res.json(resultado);
    } catch (erro: any) {
      throw new ErroPersonalizado(erro.message, 401);
    }
  }

  async registro(req: Request, res: Response): Promise<void> {
    try {
      const usuario = await autenticacaoServico.registro(req.body);
      res.status(201).json({
        mensagem: 'Utilizador criado com sucesso',
        id: usuario.id
      });
    } catch (erro: any) {
      throw new ErroPersonalizado(erro.message, 400);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // O logout real ocorre no cliente removendo o token.
    // Opcional: blacklist do token (não implementado para simplicidade).
    res.json({ mensagem: 'Logout realizado com sucesso' });
  }

  async recuperarSenha(req: Request, res: Response): Promise<void> {
    const { telefone } = req.body;
    await autenticacaoServico.solicitarRecuperacaoSenha(telefone);
    res.json({ mensagem: 'Se o telefone estiver cadastrado, um código será enviado' });
  }

  async redefinirSenha(req: Request, res: Response): Promise<void> {
    const { token, novaSenha } = req.body;
    await autenticacaoServico.redefinirSenha(token, novaSenha);
    res.json({ mensagem: 'Senha redefinida com sucesso' });
  }

  async verificarToken(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ valido: false });
      return;
    }
    const token = authHeader.split(' ')[1];
    const valido = await autenticacaoServico.verificarToken(token);
    res.json({ valido });
  }
}

export default new AutenticacaoControlador();