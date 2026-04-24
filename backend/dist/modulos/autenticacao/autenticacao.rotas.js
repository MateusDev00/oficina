"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validacao_1 = require("../../intermediarios/validacao");
const autenticacao_controlador_1 = __importDefault(require("./autenticacao.controlador"));
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        telefone: zod_1.z.string().min(9, 'Telefone deve ter pelo menos 9 dígitos'),
        senha: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
    })
});
const registroSchema = zod_1.z.object({
    body: zod_1.z.object({
        nome: zod_1.z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
        telefone: zod_1.z.string().min(9, 'Telefone deve ter pelo menos 9 dígitos'),
        senha: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        email: zod_1.z.string().email('E-mail inválido').optional()
    })
});
const recuperarSenhaSchema = zod_1.z.object({
    body: zod_1.z.object({
        telefone: zod_1.z.string().min(9)
    })
});
const redefinirSenhaSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(10),
        novaSenha: zod_1.z.string().min(6)
    })
});
router.post('/login', (0, validacao_1.validar)(loginSchema), autenticacao_controlador_1.default.login);
router.post('/registro', (0, validacao_1.validar)(registroSchema), autenticacao_controlador_1.default.registro);
router.post('/logout', autenticacao_controlador_1.default.logout);
router.post('/recuperar-senha', (0, validacao_1.validar)(recuperarSenhaSchema), autenticacao_controlador_1.default.recuperarSenha);
router.post('/redefinir-senha', (0, validacao_1.validar)(redefinirSenhaSchema), autenticacao_controlador_1.default.redefinirSenha);
router.get('/verificar', autenticacao_controlador_1.default.verificarToken);
exports.default = router;
//# sourceMappingURL=autenticacao.rotas.js.map