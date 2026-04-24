import { Utilizador } from '../../tipos';
interface DadosRegistro {
    nome: string;
    telefone: string;
    senha: string;
    email?: string;
}
declare class AutenticacaoServico {
    login(telefone: string, senha: string): Promise<{
        token: string;
        utilizador: Omit<Utilizador, 'hash_senha'>;
    }>;
    registro(dados: DadosRegistro): Promise<Utilizador>;
    verificarToken(token: string): Promise<boolean>;
    solicitarRecuperacaoSenha(telefone: string): Promise<void>;
    redefinirSenha(token: string, novaSenha: string): Promise<void>;
}
declare const _default: AutenticacaoServico;
export default _default;
//# sourceMappingURL=autenticacao.servico.d.ts.map