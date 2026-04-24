import { Request, Response } from 'express';
declare class AutenticacaoControlador {
    login(req: Request, res: Response): Promise<void>;
    registro(req: Request, res: Response): Promise<void>;
    logout(_req: Request, res: Response): Promise<void>;
    recuperarSenha(req: Request, res: Response): Promise<void>;
    redefinirSenha(req: Request, res: Response): Promise<void>;
    verificarToken(req: Request, res: Response): Promise<void>;
}
declare const _default: AutenticacaoControlador;
export default _default;
//# sourceMappingURL=autenticacao.controlador.d.ts.map