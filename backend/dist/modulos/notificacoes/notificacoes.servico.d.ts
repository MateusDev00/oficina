import { Request, Response } from 'express';
import { RequestAutenticado } from '../../intermediarios/autenticacao';
declare class NotificacoesServico {
    listar(req: RequestAutenticado, res: Response): Promise<void>;
    reenviar(req: Request, res: Response): Promise<void>;
}
declare const _default: NotificacoesServico;
export default _default;
//# sourceMappingURL=notificacoes.servico.d.ts.map