import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configuracao/ambiente';
import { query } from '../configuracao/base_de_dados';
import { Utilizador } from '../tipos';

export interface RequestAutenticado extends Request {
  utilizador?: Utilizador;
}

export async function autenticar(req: RequestAutenticado, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Token não fornecido' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const result = await query('SELECT * FROM utilizadores WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      res.status(401).json({ mensagem: 'Utilizador não encontrado' });
      return;
    }

    req.utilizador = result.rows[0] as Utilizador;
    next();
  } catch (erro) {
    res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

export function autorizar(...papeis: string[]) {
  return (req: RequestAutenticado, res: Response, next: NextFunction): void => {
    if (!req.utilizador) {
      res.status(401).json({ mensagem: 'Não autenticado' });
      return;
    }

    if (!papeis.includes(req.utilizador.papel)) {
      res.status(403).json({ mensagem: 'Acesso negado' });
      return;
    }

    next();
  };
}