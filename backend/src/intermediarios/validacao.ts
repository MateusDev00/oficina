import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validar = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (erro) {
      if (erro instanceof ZodError) {
        res.status(400).json({
          mensagem: 'Erro de validação dos dados fornecidos',
          erros: erro.errors.map((e) => ({
            campo: e.path.join('.'),
            mensagem: e.message,
          })),
        });
      } else {
        next(erro);
      }
    }
  };
};