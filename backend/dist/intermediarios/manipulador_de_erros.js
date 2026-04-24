"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErroPersonalizado = void 0;
exports.manipuladorDeErros = manipuladorDeErros;
class ErroPersonalizado extends Error {
    statusCode;
    detalhes;
    constructor(mensagem, statusCode = 500, detalhes) {
        super(mensagem);
        this.statusCode = statusCode;
        this.detalhes = detalhes;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ErroPersonalizado = ErroPersonalizado;
function manipuladorDeErros(erro, req, res, next) {
    console.error('Erro capturado:', {
        mensagem: erro.message,
        stack: erro.stack,
        url: req.originalUrl,
        metodo: req.method,
        ip: req.ip
    });
    if (erro instanceof ErroPersonalizado) {
        res.status(erro.statusCode).json({
            mensagem: erro.message,
            detalhes: erro.detalhes
        });
        return;
    }
    // Erro de sintaxe JSON
    if (erro instanceof SyntaxError && 'body' in erro) {
        res.status(400).json({
            mensagem: 'JSON inválido no corpo da requisição'
        });
        return;
    }
    // Erro genérico (não expor detalhes em produção)
    const isProducao = process.env.NODE_ENV === 'producao';
    res.status(500).json({
        mensagem: 'Erro interno do servidor',
        ...(isProducao ? {} : { stack: erro.stack })
    });
}
//# sourceMappingURL=manipulador_de_erros.js.map