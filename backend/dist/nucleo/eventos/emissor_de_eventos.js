"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitirEvento = emitirEvento;
exports.marcarComoProcessado = marcarComoProcessado;
const base_de_dados_1 = require("../../configuracao/base_de_dados");
const redis_1 = __importDefault(require("../../configuracao/redis"));
const EVENTOS_VALIDOS = [
    'ORDEM_CRIADA',
    'ORDEM_ATRASADA',
    'PAGAMENTO_CONFIRMADO',
    'TECNICO_INDISPONIVEL',
    'ORDEM_CONCLUIDA',
    'AGENDAMENTO_ALTERADO',
    'CLIENTE_NOTIFICADO',
    'REAGENDAMENTO_AUTOMATICO'
];
async function emitirEvento(tipo, payload, metadados = {}) {
    if (!EVENTOS_VALIDOS.includes(tipo)) {
        throw new Error(`Tipo de evento invalido: ${tipo}`);
    }
    const payloadJSON = JSON.stringify(payload);
    const resultado = await (0, base_de_dados_1.query)(`INSERT INTO eventos (tipo, payload, processado)
     VALUES ($1, $2, FALSE)
     RETURNING id, criado_em`, [tipo, payloadJSON]);
    const evento = {
        id: resultado.rows[0].id,
        tipo,
        payload,
        processado: false,
        tentativas: 0,
        ultimo_erro: null,
        criado_em: resultado.rows[0].criado_em,
        processado_em: null
    };
    await redis_1.default.publish('eventos:sistema', JSON.stringify({
        id: evento.id,
        tipo,
        payload,
        metadados,
        criado_em: evento.criado_em
    }));
    await redis_1.default.lpush('fila:eventos:pendentes', evento.id.toString());
    console.log(`[Evento] ${tipo} emitido (ID: ${evento.id})`);
    return evento;
}
async function marcarComoProcessado(eventoId, erro) {
    if (erro) {
        await (0, base_de_dados_1.query)(`UPDATE eventos 
       SET tentativas = tentativas + 1, 
           ultimo_erro = $2 
       WHERE id = $1`, [eventoId, erro.message]);
    }
    else {
        await (0, base_de_dados_1.query)(`UPDATE eventos 
       SET processado = TRUE, 
           processado_em = NOW() 
       WHERE id = $1`, [eventoId]);
    }
}
//# sourceMappingURL=emissor_de_eventos.js.map