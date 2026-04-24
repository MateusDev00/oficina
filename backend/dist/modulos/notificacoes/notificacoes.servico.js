"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_de_dados_1 = require("../../configuracao/base_de_dados");
class NotificacoesServico {
    async listar(req, res) {
        const utilizador = req.utilizador;
        const result = await (0, base_de_dados_1.query)(`SELECT * FROM notificacoes WHERE utilizador_id = $1 ORDER BY criado_em DESC`, [utilizador.id]);
        res.json(result.rows);
    }
    async reenviar(req, res) {
        const { id } = req.params;
        await (0, base_de_dados_1.query)(`UPDATE notificacoes SET estado = 'pendente', enviado_em = NULL, atualizado_em = NOW() WHERE id = $1`, [id]);
        res.json({ mensagem: 'Notificação será reenviada' });
    }
}
exports.default = new NotificacoesServico();
//# sourceMappingURL=notificacoes.servico.js.map