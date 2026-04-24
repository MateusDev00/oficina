import { Request, Response, NextFunction } from 'express';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizarObjeto(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizarObjeto(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [chave, valor] of Object.entries(obj)) {
      sanitized[chave] = sanitizarObjeto(valor);
    }
    return sanitized;
  }
  
  return obj;
}

export function sanitizarInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    req.body = sanitizarObjeto(req.body);
  }
  if (req.query) {
    req.query = sanitizarObjeto(req.query);
  }
  if (req.params) {
    req.params = sanitizarObjeto(req.params);
  }
  next();
}