import { Request, Response } from 'express';
import { RequestAutenticado } from '../../intermediarios/autenticacao';
declare class AgendamentoServico {
    verificarDisponibilidade(req: Request, res: Response): Promise<void>;
    criarAgendamento(req: RequestAutenticado, res: Response): Promise<void>;
    listarTecnicosDisponiveis(_req: Request, res: Response): Promise<void>;
}
declare const _default: AgendamentoServico;
export default _default;
//# sourceMappingURL=agendamento.servico.d.ts.map