import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { manipuladorDeErros } from './intermediarios/manipulador_de_erros';
import { sanitizarInput } from './intermediarios/sanitizacao';
import autenticacaoRotas from './modulos/autenticacao/autenticacao.rotas';
import utilizadoresRotas from './modulos/utilizadores/utilizadores.rotas';
import ordensRotas from './modulos/ordens/ordens.rotas';
import agendamentoRotas from './modulos/agendamento/agendamento.rotas';
import notificacoesRotas from './modulos/notificacoes/notificacoes.rotas';
import pagamentosRotas from './modulos/pagamentos/pagamentos.rotas';
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, ALLOWED_ORIGINS } from './configuracao/ambiente';

// 1. Criar a instância do Express
const app = express();

// 2. Middlewares de segurança e utilidade
app.use(helmet());

// 3. Configuração de CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pelo CORS'));
      }
    },
    credentials: true,
  })
);

// 4. Parsing de JSON
app.use(express.json({ limit: '10mb' }));

// 5. Sanitização de inputs
app.use(sanitizarInput);

// 6. Rate limiting global para /api
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { mensagem: 'Muitas requisições, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 7. Rotas da API
app.use('/api/autenticacao', autenticacaoRotas);
app.use('/api/utilizadores', utilizadoresRotas);
app.use('/api/ordens', ordensRotas);
app.use('/api/agendamento', agendamentoRotas);
app.use('/api/notificacoes', notificacoesRotas);
app.use('/api/pagamentos', pagamentosRotas);

// 8. Rota de saúde
app.get('/saude', (_req, res) => {
  res.json({ status: 'ativo', servico: 'backend-oficina-lpn', timestamp: new Date().toISOString() });
});

// 9. Middleware de tratamento de erros (deve ser o último)
app.use(manipuladorDeErros);

export default app;