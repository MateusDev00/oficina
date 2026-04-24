"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacao_1 = require("../../intermediarios/autenticacao");
const utilizadores_servico_1 = __importDefault(require("./utilizadores.servico"));
const router = (0, express_1.Router)();
router.get('/', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador'), utilizadores_servico_1.default.listar);
router.get('/:id', autenticacao_1.autenticar, utilizadores_servico_1.default.obterPorId);
router.put('/:id', autenticacao_1.autenticar, utilizadores_servico_1.default.atualizar);
router.patch('/:id/disponibilidade', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('tecnico', 'administrador'), utilizadores_servico_1.default.atualizarDisponibilidade);
router.delete('/:id', autenticacao_1.autenticar, (0, autenticacao_1.autorizar)('administrador'), utilizadores_servico_1.default.remover);
exports.default = router;
//# sourceMappingURL=utilizadores.rotas.js.map