"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manipularOrdemCriada = manipularOrdemCriada;
exports.manipularOrdemAtrasada = manipularOrdemAtrasada;
exports.manipularOrdemConcluida = manipularOrdemConcluida;
const emissor_de_eventos_1 = require("../emissor_de_eventos");
const base_de_dados_1 = require("../../../configuracao/base_de_dados");
const redis_1 = __importDefault(require("../../../configuracao/redis"));
async function manipularOrdemCriada(payload) {
    const { ordem_id, cliente_id } = payload;
    if (!ordem_id || !cliente_id)
        return;
    await redis_1.default.del(`cliente:${cliente_id}:ordens`);
    await (0, emissor_de_eventos_1.emitirEvento)('CLIENTE_NOTIFICADO', {
        cliente_id,
        ordem_id,
        tipo_notificacao: 'confirmacao_agendamento',
    });
}
async function manipularOrdemAtrasada(payload) {
    const { ordem_id, cliente_id, dias_atraso } = payload;
    if (!ordem_id || !cliente_id)
        return;
    await (0, base_de_dados_1.query)(`INSERT INTO logs_auditoria (utilizador_id, acao, entidade, entidade_id, detalhes)
     VALUES ($1, $2, $3, $4, $5)`, [cliente_id, 'ORDEM_ATRASADA_DETECTADA', 'ordens_servico', ordem_id, { dias_atraso }]);
}
async function manipularOrdemConcluida(payload) {
    const { ordem_id, cliente_id } = payload;
    if (!ordem_id)
        return;
    if (cliente_id) {
        await redis_1.default.del(`cliente:${cliente_id}:ordens`);
        await (0, emissor_de_eventos_1.emitirEvento)('CLIENTE_NOTIFICADO', {
            cliente_id,
            ordem_id,
            tipo_notificacao: 'ordem_concluida',
        });
    }
}
//# sourceMappingURL=eventos_de_ordem.js.map