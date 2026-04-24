import { Request, Response, NextFunction } from 'express';
export declare class ErroPersonalizado extends Error {
    statusCode: number;
    detalhes?: any;
    constructor(mensagem: string, statusCode?: number, detalhes?: any);
}
export declare function manipuladorDeErros(erro: Error | ErroPersonalizado, req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=manipulador_de_erros.d.ts.map