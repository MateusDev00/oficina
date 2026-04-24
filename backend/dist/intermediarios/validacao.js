"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validar = void 0;
const zod_1 = require("zod");
const validar = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (erro) {
            if (erro instanceof zod_1.ZodError) {
                res.status(400).json({
                    mensagem: 'Erro de validação dos dados fornecidos',
                    erros: erro.errors.map((e) => ({
                        campo: e.path.join('.'),
                        mensagem: e.message,
                    })),
                });
            }
            else {
                next(erro);
            }
        }
    };
};
exports.validar = validar;
//# sourceMappingURL=validacao.js.map