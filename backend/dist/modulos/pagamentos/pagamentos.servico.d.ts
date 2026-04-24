import { Request, Response } from 'express';
declare class PagamentosServico {
    listar(_req: Request, res: Response): Promise<void>;
    obterPorId(req: Request, res: Response): Promise<void>;
}
declare const _default: PagamentosServico;
export default _default;
//# sourceMappingURL=pagamentos.servico.d.ts.map