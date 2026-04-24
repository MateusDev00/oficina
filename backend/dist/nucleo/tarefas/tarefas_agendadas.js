"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarVerificacaoOrdensAtrasadas = iniciarVerificacaoOrdensAtrasadas;
exports.iniciarLimpezaCache = iniciarLimpezaCache;
exports.iniciarTodasTarefas = iniciarTodasTarefas;
const node_cron_1 = __importDefault(require("node-cron"));
const base_de_dados_1 = require("../../configuracao/base_de_dados");
const emissor_de_eventos_1 = require("../eventos/emissor_de_eventos");
const redis_1 = __importDefault(require("../../configuracao/redis"));
function iniciarVerificacaoOrdensAtrasadas() {
    node_cron_1.default.schedule('0 8 * * *', async () => {
        console.log('[Tarefa] Verificando ordens atrasadas...');
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const result = await (0, base_de_dados_1.query)(`SELECT id, cliente_id, data_agendada
         FROM ordens_servico
         WHERE data_agendada < $1
           AND estado NOT IN ('concluida', 'cancelada')
           AND data_agendada IS NOT NULL`, [hoje]);
            for (const ordem of result.rows) {
                const diasAtraso = Math.floor((Date.now() - new Date(ordem.data_agendada).getTime()) / 86400000);
                await (0, emissor_de_eventos_1.emitirEvento)('ORDEM_ATRASADA', {
                    ordem_id: ordem.id,
                    cliente_id: ordem.cliente_id,
                    dias_atraso: diasAtraso,
                });
            }
        }
        catch (erro) {
            console.error('Erro na verificação de ordens atrasadas:', erro);
        }
    });
}
function iniciarLimpezaCache() {
    node_cron_1.default.schedule('0 * * * *', async () => {
        try {
            const chaves = await redis_1.default.keys('temp:*');
            for (const chave of chaves) {
                const ttl = await redis_1.default.ttl(chave);
                if (ttl === -1) {
                    await redis_1.default.del(chave);
                }
            }
        }
        catch (erro) {
            console.error('Erro na limpeza de cache:', erro);
        }
    });
}
function iniciarTodasTarefas() {
    iniciarVerificacaoOrdensAtrasadas();
    iniciarLimpezaCache();
    console.log('Tarefas agendadas iniciadas.');
}
//# sourceMappingURL=tarefas_agendadas.js.map