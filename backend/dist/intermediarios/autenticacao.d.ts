import { Request, Response, NextFunction } from 'express';
import { Utilizador } from '../tipos';
export interface RequestAutenticado extends Request {
    utilizador?: Utilizador;
}
export declare function autenticar(req: RequestAutenticado, res: Response, next: NextFunction): Promise<void>;
export declare function autorizar(...papeis: string[]): (req: RequestAutenticado, res: Response, next: NextFunction) => void;
//# sourceMappingURL=autenticacao.d.ts.map