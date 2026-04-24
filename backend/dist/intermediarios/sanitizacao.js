"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizarInput = sanitizarInput;
const jsdom_1 = require("jsdom");
const dompurify_1 = __importDefault(require("dompurify"));
const window = new jsdom_1.JSDOM('').window;
const DOMPurify = (0, dompurify_1.default)(window);
function sanitizarObjeto(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'string') {
        return DOMPurify.sanitize(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizarObjeto(item));
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [chave, valor] of Object.entries(obj)) {
            sanitized[chave] = sanitizarObjeto(valor);
        }
        return sanitized;
    }
    return obj;
}
function sanitizarInput(req, res, next) {
    if (req.body) {
        req.body = sanitizarObjeto(req.body);
    }
    if (req.query) {
        req.query = sanitizarObjeto(req.query);
    }
    if (req.params) {
        req.params = sanitizarObjeto(req.params);
    }
    next();
}
//# sourceMappingURL=sanitizacao.js.map