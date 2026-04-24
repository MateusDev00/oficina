"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validacao_1 = require("../../intermediarios/validacao");
const autenticacao_1 = require("../../intermediarios/autenticacao");
const agendamento_servico_1 = __importDefault(require("./agendamento.servico"));
const router = (0, express_1.Router)();
const verificarDisponibilidadeSchema = zod_1.z.object({
    query: zod_1.z.object({
        data: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    })
});
const criarAgendamentoSchema = zod_1.z.object({
    body: zod_1.z.object({
        cliente_id: zod_1.z.number().int().positive(),
        veiculo_id: zod_1.z.number().int().positive(),
        descricao: zod_1.z.string().min(10),
        data_agendada: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        hora_agendada: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
        servicos_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional()
    })
});
router.get('/disponibilidade', autenticacao_1.autenticar, (0, validacao_1.validar)(verificarDisponibilidadeSchema), agendamento_servico_1.default.verificarDisponibilidade);
router.post('/', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('cliente', 'administrador'), (0, validacao_1.validar)(criarAgendamentoSchema), agendamento_servico_1.default.criarAgendamento);
router.get('/tecnicos', autenticacao_1.autenticar, agendamento_servico_1.default.listarTecnicosDisponiveis);
exports.default = router;
//# sourceMappingURL=agendamento.rotas.js.map