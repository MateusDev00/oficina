"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacao_1 = require("../../intermediarios/autenticacao");
const notificacoes_servico_1 = __importDefault(require("./notificacoes.servico"));
const router = (0, express_1.Router)();
router.get('/', autenticacao_1.autenticar, notificacoes_servico_1.default.listar);
router.post('/:id/reenviar', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador'), notificacoes_servico_1.default.reenviar);
exports.default = router;
//# sourceMappingURL=notificacoes.rotas.js.map