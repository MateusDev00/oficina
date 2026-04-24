import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
export declare const validar: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validacao.d.ts.map