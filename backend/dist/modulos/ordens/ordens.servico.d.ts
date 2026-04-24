import { Request, Response } from 'express';
import { RequestAutenticado } from '../../intermediarios/autenticacao';
declare class OrdensServico {
    listar(req: RequestAutenticado, res: Response): Promise<void>;
    obterPorId(req: Request, res: Response): Promise<void>;
    criar(req: RequestAutenticado, res: Response): Promise<void>;
    atualizarStatus(req: RequestAutenticado, res: Response): Promise<void>;
    atribuirTecnico(req: Request, res: Response): Promise<void>;
    registarPagamento(req: Request, res: Response): Promise<void>;
}
declare const _default: OrdensServico;
export default _default;
//# sourceMappingURL=ordens.servico.d.ts.map