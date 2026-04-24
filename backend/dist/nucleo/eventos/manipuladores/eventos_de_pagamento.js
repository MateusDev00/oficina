"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manipularPagamentoConfirmado = manipularPagamentoConfirmado;
const base_de_dados_1 = require("../../../configuracao/base_de_dados");
const redis_1 = __importDefault(require("../../../configuracao/redis"));
const emissor_de_eventos_1 = require("../emissor_de_eventos");
async function manipularPagamentoConfirmado(payload) {
    const { ordem_id } = payload;
    if (!ordem_id)
        return;
    await (0, base_de_dados_1.query)(`UPDATE ordens_servico SET estado_pagamento = 'pago', atualizado_em = NOW() WHERE id = $1`, [ordem_id]);
    await redis_1.default.del(`ordem:${ordem_id}`);
    const ordem = await (0, base_de_dados_1.query)(`SELECT cliente_id FROM ordens_servico WHERE id = $1`, [ordem_id]);
    if (ordem.rows.length > 0) {
        await (0, emissor_de_eventos_1.emitirEvento)('CLIENTE_NOTIFICADO', {
            cliente_id: ordem.rows[0].cliente_id,
            ordem_id,
            tipo_notificacao: 'pagamento_confirmado',
        });
    }
}
//# sourceMappingURL=eventos_de_pagamento.js.map