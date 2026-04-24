import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../configuracao/ambiente';

export const limiteDeTaxa = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensagem: 'Muitas requisições deste IP, tente novamente mais tarde.',
  },
  skip: (req: Request): boolean => {
    return req.path === '/saude' || req.path === '/health';
  },
  keyGenerator: (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      mensagem: 'Limite de requisições excedido. Aguarde antes de tentar novamente.',
    });
  },
});

export const limiteDeTaxaAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    mensagem: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
  },
});