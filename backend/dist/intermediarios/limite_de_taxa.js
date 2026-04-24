"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiteDeTaxaAuth = exports.limiteDeTaxa = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ambiente_1 = require("../configuracao/ambiente");
exports.limiteDeTaxa = (0, express_rate_limit_1.default)({
    windowMs: ambiente_1.RATE_LIMIT_WINDOW_MS,
    max: ambiente_1.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        mensagem: 'Muitas requisições deste IP, tente novamente mais tarde.',
    },
    skip: (req) => {
        return req.path === '/saude' || req.path === '/health';
    },
    keyGenerator: (req) => {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim();
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
    },
    handler: (_req, res) => {
        res.status(429).json({
            mensagem: 'Limite de requisições excedido. Aguarde antes de tentar novamente.',
        });
    },
});
exports.limiteDeTaxaAuth = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: {
        mensagem: 'Muitas tentativas de autenticação. Tente novamente mais tarde.',
    },
});
//# sourceMappingURL=limite_de_taxa.js.map