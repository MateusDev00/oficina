"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = autenticar;
exports.autorizar = autorizar;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ambiente_1 = require("../configuracao/ambiente");
const base_de_dados_1 = require("../configuracao/base_de_dados");
async function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ mensagem: 'Token não fornecido' });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ambiente_1.JWT_SECRET);
        const result = await (0, base_de_dados_1.query)('SELECT * FROM utilizadores WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
            res.status(401).json({ mensagem: 'Utilizador não encontrado' });
            return;
        }
        req.utilizador = result.rows[0];
        next();
    }
    catch (erro) {
        res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }
}
function autorizar(...papeis) {
    return (req, res, next) => {
        if (!req.utilizador) {
            res.status(401).json({ mensagem: 'Não autenticado' });
            return;
        }
        if (!papeis.includes(req.utilizador.papel)) {
            res.status(403).json({ mensagem: 'Acesso negado' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=autenticacao.js.map