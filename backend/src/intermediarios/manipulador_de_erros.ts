import { Request, Response, NextFunction } from 'express';

export class ErroPersonalizado extends Error {
  public statusCode: number;
  public detalhes?: any;

  constructor(mensagem: string, statusCode: number = 500, detalhes?: any) {
    super(mensagem);
    this.statusCode = statusCode;
    this.detalhes = detalhes;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function manipuladorDeErros(
  erro: Error | ErroPersonalizado,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Erro capturado:', {
    mensagem: erro.message,
    stack: erro.stack,
    url: req.originalUrl,
    metodo: req.method,
    ip: req.ip
  });

  if (erro instanceof ErroPersonalizado) {
    res.status(erro.statusCode).json({
      mensagem: erro.message,
      detalhes: erro.detalhes
    });
    return;
  }

  // Erro de sintaxe JSON
  if (erro instanceof SyntaxError && 'body' in erro) {
    res.status(400).json({
      mensagem: 'JSON inválido no corpo da requisição'
    });
    return;
  }

  // Erro genérico (não expor detalhes em produção)
  const isProducao = process.env.NODE_ENV === 'producao';
  res.status(500).json({
    mensagem: 'Erro interno do servidor',
    ...(isProducao ? {} : { stack: erro.stack })
  });
}