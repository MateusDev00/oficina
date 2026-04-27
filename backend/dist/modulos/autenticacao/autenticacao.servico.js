"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const base_de_dados_1 = require("../../configuracao/base_de_dados");
const ambiente_1 = require("../../configuracao/ambiente");
const redis_1 = __importDefault(require("../../configuracao/redis"));
class AutenticacaoServico {
    async login(telefone, senha) {
        const result = await (0, base_de_dados_1.query)('SELECT * FROM utilizadores WHERE telefone = $1', [telefone]);
        if (result.rows.length === 0) {
            throw new Error('Credenciais inválidas');
        }
        const utilizador = result.rows[0];
        const senhaValida = await bcrypt_1.default.compare(senha, utilizador.hash_senha);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }
        if (!utilizador.disponivel) {
            throw new Error('Utilizador inativo. Contacte o administrador.');
        }
        const payload = { id: utilizador.id };
        const secret = ambiente_1.JWT_SECRET;
        const options = {
            expiresIn: ambiente_1.JWT_EXPIRES_IN, // compatibilidade com versões recentes
        };
        const token = jsonwebtoken_1.default.sign(payload, secret, options);
        const { hash_senha, ...utilizadorSemSenha } = utilizador;
        return { token, utilizador: utilizadorSemSenha };
    }
    async registro(dados) {
        const existente = await (0, base_de_dados_1.query)('SELECT id FROM utilizadores WHERE telefone = $1', [dados.telefone]);
        if (existente.rows.length > 0) {
            throw new Error('Telefone já cadastrado');
        }
        if (dados.email) {
            const emailExistente = await (0, base_de_dados_1.query)('SELECT id FROM utilizadores WHERE email = $1', [dados.email]);
            if (emailExistente.rows.length > 0) {
                throw new Error('E-mail já cadastrado');
            }
        }
        const hash_senha = await bcrypt_1.default.hash(dados.senha, 10);
        const result = await (0, base_de_dados_1.query)(`INSERT INTO utilizadores (nome, telefone, email, hash_senha, papel, disponivel)
       VALUES ($1, $2, $3, $4, 'cliente', true)
       RETURNING *`, [dados.nome, dados.telefone, dados.email || null, hash_senha]);
        return result.rows[0];
    }
    async verificarToken(token) {
        try {
            jsonwebtoken_1.default.verify(token, ambiente_1.JWT_SECRET);
            return true;
        }
        catch {
            return false;
        }
    }
    async solicitarRecuperacaoSenha(telefone) {
        const result = await (0, base_de_dados_1.query)('SELECT id, nome FROM utilizadores WHERE telefone = $1', [telefone]);
        if (result.rows.length === 0) {
            return; // Não revela se existe ou não
        }
        const utilizador = result.rows[0];
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiraEm = 3600; // 1 hora
        await redis_1.default.setex(`recuperacao:${token}`, expiraEm, utilizador.id.toString());
        console.log(`Token de recuperação para ${telefone}: ${token}`);
        await (0, base_de_dados_1.query)(`INSERT INTO notificacoes (utilizador_id, canal, conteudo, estado)
       VALUES ($1, 'whatsapp', $2, 'pendente')`, [utilizador.id, `Seu código de recuperação: ${token.substring(0, 8)}`]);
    }
    async redefinirSenha(token, novaSenha) {
        const utilizadorId = await redis_1.default.get(`recuperacao:${token}`);
        if (!utilizadorId) {
            throw new Error('Token inválido ou expirado');
        }
        const hash = await bcrypt_1.default.hash(novaSenha, 10);
        await (0, base_de_dados_1.query)('UPDATE utilizadores SET hash_senha = $1, atualizado_em = NOW() WHERE id = $2', [hash, utilizadorId]);
        await redis_1.default.del(`recuperacao:${token}`);
    }
}
exports.default = new AutenticacaoServico();
//# sourceMappingURL=autenticacao.servico.js.map