"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacao_1 = require("../../intermediarios/autenticacao");
const pagamentos_servico_1 = __importDefault(require("./pagamentos.servico"));
const router = (0, express_1.Router)();
router.get('/', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador'), pagamentos_servico_1.default.listar);
router.get('/:id', autenticacao_1.autenticar, pagamentos_servico_1.default.obterPorId);
exports.default = router;
//# sourceMappingURL=pagamentos.rotas.js.map