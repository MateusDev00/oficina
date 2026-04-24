"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_de_dados_1 = require("../../configuracao/base_de_dados");
class PagamentosServico {
    async listar(_req, res) {
        const result = await (0, base_de_dados_1.query)(`SELECT p.*, o.descricao as ordem_descricao, u.nome as cliente_nome
       FROM pagamentos p
       JOIN ordens_servico o ON p.ordem_servico_id = o.id
       JOIN utilizadores u ON o.cliente_id = u.id
       ORDER BY p.criado_em DESC`);
        res.json(result.rows);
    }
    async obterPorId(req, res) {
        const { id } = req.params;
        const result = await (0, base_de_dados_1.query)(`SELECT p.*, o.descricao, o.estado as ordem_estado
       FROM pagamentos p
       JOIN ordens_servico o ON p.ordem_servico_id = o.id
       WHERE p.id = $1`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ mensagem: 'Pagamento não encontrado' });
            return;
        }
        res.json(result.rows[0]);
    }
}
exports.default = new PagamentosServico();
//# sourceMappingURL=pagamentos.servico.js.map