"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autenticacao_servico_1 = __importDefault(require("./autenticacao.servico"));
const manipulador_de_erros_1 = require("../../intermediarios/manipulador_de_erros");
class AutenticacaoControlador {
    async login(req, res) {
        try {
            const { telefone, senha } = req.body;
            const resultado = await autenticacao_servico_1.default.login(telefone, senha);
            res.json(resultado);
        }
        catch (erro) {
            throw new manipulador_de_erros_1.ErroPersonalizado(erro.message, 401);
        }
    }
    async registro(req, res) {
        try {
            const usuario = await autenticacao_servico_1.default.registro(req.body);
            res.status(201).json({
                mensagem: 'Utilizador criado com sucesso',
                id: usuario.id
            });
        }
        catch (erro) {
            throw new manipulador_de_erros_1.ErroPersonalizado(erro.message, 400);
        }
    }
    async logout(_req, res) {
        // O logout real ocorre no cliente removendo o token.
        // Opcional: blacklist do token (não implementado para simplicidade).
        res.json({ mensagem: 'Logout realizado com sucesso' });
    }
    async recuperarSenha(req, res) {
        const { telefone } = req.body;
        await autenticacao_servico_1.default.solicitarRecuperacaoSenha(telefone);
        res.json({ mensagem: 'Se o telefone estiver cadastrado, um código será enviado' });
    }
    async redefinirSenha(req, res) {
        const { token, novaSenha } = req.body;
        await autenticacao_servico_1.default.redefinirSenha(token, novaSenha);
        res.json({ mensagem: 'Senha redefinida com sucesso' });
    }
    async verificarToken(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ valido: false });
            return;
        }
        const token = authHeader.split(' ')[1];
        const valido = await autenticacao_servico_1.default.verificarToken(token);
        res.json({ valido });
    }
}
exports.default = new AutenticacaoControlador();
//# sourceMappingURL=autenticacao.controlador.js.map