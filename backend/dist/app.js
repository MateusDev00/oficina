"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const manipulador_de_erros_1 = require("./intermediarios/manipulador_de_erros");
const sanitizacao_1 = require("./intermediarios/sanitizacao");
const autenticacao_rotas_1 = __importDefault(require("./modulos/autenticacao/autenticacao.rotas"));
const utilizadores_rotas_1 = __importDefault(require("./modulos/utilizadores/utilizadores.rotas"));
const ordens_rotas_1 = __importDefault(require("./modulos/ordens/ordens.rotas"));
const agendamento_rotas_1 = __importDefault(require("./modulos/agendamento/agendamento.rotas"));
const notificacoes_rotas_1 = __importDefault(require("./modulos/notificacoes/notificacoes.rotas"));
const pagamentos_rotas_1 = __importDefault(require("./modulos/pagamentos/pagamentos.rotas"));
const ambiente_1 = require("./configuracao/ambiente");
// 1. Criar a instância do Express
const app = (0, express_1.default)();
// 2. Middlewares de segurança e utilidade
app.use((0, helmet_1.default)());
// 3. Configuração de CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || ambiente_1.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Origem não permitida pelo CORS'));
        }
    },
    credentials: true,
}));
// 4. Parsing de JSON
app.use(express_1.default.json({ limit: '10mb' }));
// 5. Sanitização de inputs
app.use(sanitizacao_1.sanitizarInput);
// 6. Rate limiting global para /api
const limiter = (0, express_rate_limit_1.default)({
    windowMs: ambiente_1.RATE_LIMIT_WINDOW_MS,
    max: ambiente_1.RATE_LIMIT_MAX,
    message: { mensagem: 'Muitas requisições, tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// 7. Rotas da API
app.use('/api/autenticacao', autenticacao_rotas_1.default);
app.use('/api/utilizadores', utilizadores_rotas_1.default);
app.use('/api/ordens', ordens_rotas_1.default);
app.use('/api/agendamento', agendamento_rotas_1.default);
app.use('/api/notificacoes', notificacoes_rotas_1.default);
app.use('/api/pagamentos', pagamentos_rotas_1.default);
// 8. Rota de saúde
app.get('/saude', (_req, res) => {
    res.json({ status: 'ativo', servico: 'backend-oficina-lpn', timestamp: new Date().toISOString() });
});
// 9. Middleware de tratamento de erros (deve ser o último)
app.use(manipulador_de_erros_1.manipuladorDeErros);
exports.default = app;
//# sourceMappingURL=app.js.map