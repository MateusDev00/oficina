"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_de_dados_1 = require("../../configuracao/base_de_dados");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UtilizadoresServico {
    async listar(_req, res) {
        const result = await (0, base_de_dados_1.query)(`SELECT id, nome, email, telefone, papel, especialidade, disponivel, criado_em 
       FROM utilizadores ORDER BY nome`);
        res.json(result.rows);
    }
    async obterPorId(req, res) {
        const { id } = req.params;
        const result = await (0, base_de_dados_1.query)(`SELECT id, nome, email, telefone, papel, especialidade, disponivel, endereco, metodo_contacto_preferido, criado_em 
       FROM utilizadores WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ mensagem: 'Utilizador não encontrado' });
            return;
        }
        res.json(result.rows[0]);
    }
    async atualizar(req, res) {
        const { id } = req.params;
        const utilizadorAutenticado = req.utilizador;
        if (utilizadorAutenticado.papel !== 'administrador' && utilizadorAutenticado.id !== parseInt(id)) {
            res.status(403).json({ mensagem: 'Acesso negado' });
            return;
        }
        const { nome, email, telefone, endereco, metodo_contacto_preferido, senha } = req.body;
        const campos = [];
        const valores = [];
        let contador = 1;
        if (nome) {
            campos.push(`nome = $${contador++}`);
            valores.push(nome);
        }
        if (email !== undefined) {
            campos.push(`email = $${contador++}`);
            valores.push(email);
        }
        if (telefone) {
            campos.push(`telefone = $${contador++}`);
            valores.push(telefone);
        }
        if (endereco !== undefined) {
            campos.push(`endereco = $${contador++}`);
            valores.push(endereco);
        }
        if (metodo_contacto_preferido) {
            campos.push(`metodo_contacto_preferido = $${contador++}`);
            valores.push(metodo_contacto_preferido);
        }
        if (senha) {
            const hash = await bcrypt_1.default.hash(senha, 10);
            campos.push(`hash_senha = $${contador++}`);
            valores.push(hash);
        }
        if (campos.length === 0) {
            res.status(400).json({ mensagem: 'Nenhum campo para atualizar' });
            return;
        }
        campos.push(`atualizado_em = NOW()`);
        valores.push(id);
        await (0, base_de_dados_1.query)(`UPDATE utilizadores SET ${campos.join(', ')} WHERE id = $${contador}`, valores);
        res.json({ mensagem: 'Utilizador atualizado com sucesso' });
    }
    async atualizarDisponibilidade(req, res) {
        const { id } = req.params;
        const { disponivel } = req.body;
        const utilizadorAutenticado = req.utilizador;
        if (utilizadorAutenticado.papel !== 'administrador' && utilizadorAutenticado.id !== parseInt(id)) {
            res.status(403).json({ mensagem: 'Acesso negado' });
            return;
        }
        await (0, base_de_dados_1.query)('UPDATE utilizadores SET disponivel = $1, atualizado_em = NOW() WHERE id = $2', [disponivel, id]);
        res.json({ mensagem: 'Disponibilidade atualizada' });
    }
    async remover(req, res) {
        const { id } = req.params;
        await (0, base_de_dados_1.query)('DELETE FROM utilizadores WHERE id = $1', [id]);
        res.json({ mensagem: 'Utilizador removido' });
    }
}
exports.default = new UtilizadoresServico();
//# sourceMappingURL=utilizadores.servico.js.map