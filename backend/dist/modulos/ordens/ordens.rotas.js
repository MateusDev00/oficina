"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validacao_1 = require("../../intermediarios/validacao");
const autenticacao_1 = require("../../intermediarios/autenticacao");
const ordens_servico_1 = __importDefault(require("./ordens.servico"));
const router = (0, express_1.Router)();
const criarOrdemSchema = zod_1.z.object({
    body: zod_1.z.object({
        cliente_id: zod_1.z.number().int().positive(),
        veiculo_id: zod_1.z.number().int().positive(),
        descricao: zod_1.z.string().min(10),
        data_agendada: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        prioridade: zod_1.z.enum(['baixa', 'media', 'alta']).optional(),
        servicos_ids: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
        pecas: zod_1.z.array(zod_1.z.object({
            peca_id: zod_1.z.number().int().positive(),
            quantidade: zod_1.z.number().int().positive()
        })).optional()
    })
});
router.get('/', autenticacao_1.autenticar, ordens_servico_1.default.listar);
router.get('/:id', autenticacao_1.autenticar, ordens_servico_1.default.obterPorId);
router.post('/', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador', 'tecnico'), (0, validacao_1.validar)(criarOrdemSchema), ordens_servico_1.default.criar);
router.patch('/:id/status', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('tecnico', 'administrador'), ordens_servico_1.default.atualizarStatus);
router.patch('/:id/tecnico', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador'), ordens_servico_1.default.atribuirTecnico);
router.post('/:id/pagamento', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador'), ordens_servico_1.default.registarPagamento);
exports.default = router;
//# sourceMappingURL=ordens.rotas.js.map