import { Request, Response } from 'express';
import { RequestAutenticado } from '../../intermediarios/autenticacao';
declare class UtilizadoresServico {
    listar(_req: Request, res: Response): Promise<void>;
    obterPorId(req: Request, res: Response): Promise<void>;
    atualizar(req: RequestAutenticado, res: Response): Promise<void>;
    atualizarDisponibilidade(req: RequestAutenticado, res: Response): Promise<void>;
    remover(req: Request, res: Response): Promise<void>;
}
declare const _default: UtilizadoresServico;
export default _default;
//# sourceMappingURL=utilizadores.servico.d.ts.map