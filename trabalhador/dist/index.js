"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const redis_1 = require("./configuracao/redis");
const base_de_dados_1 = require("./configuracao/base_de_dados");
const processador_de_eventos_1 = require("./trabalhadores/processador_de_eventos");
const monitor_de_ordens_1 = require("./trabalhadores/monitor_de_ordens");
const escalonador_de_tecnicos_1 = require("./trabalhadores/escalonador_de_tecnicos");
const disparador_de_notificacoes_1 = require("./trabalhadores/disparador_de_notificacoes");
async function iniciar() {
    console.log('🚀 Iniciando Trabalhador Autónomo da Oficina LPN...');
    // Testar e aguardar PostgreSQL com retry
    let dbOk = false;
    for (let tentativa = 1; tentativa <= 5; tentativa++) {
        try {
            const resultado = await (0, base_de_dados_1.query)('SELECT NOW() as agora');
            console.log(`✅ PostgreSQL conectado (${resultado.rows[0].agora})`);
            dbOk = true;
            break;
        }
        catch (erro) {
            console.error(`Tentativa ${tentativa}/5 - PostgreSQL falhou: ${erro.message}`);
            if (tentativa < 5) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }
    if (!dbOk) {
        console.error('❌ PostgreSQL indisponível após 5 tentativas. Encerrando.');
        process.exit(1);
    }
    // Testar Redis
    const redisOk = await (0, redis_1.testarConexaoRedis)();
    if (redisOk) {
        console.log('✅ Redis (Upstash) conectado.');
    }
    else {
        console.warn('⚠️ Redis indisponível.');
    }
    // Agendar tarefas
    node_cron_1.default.schedule('*/5 * * * * *', async () => {
        await (0, processador_de_eventos_1.executarProcessador)();
    });
    node_cron_1.default.schedule('0 8 * * *', async () => {
        console.log('[Cron] Verificando ordens atrasadas...');
        await (0, monitor_de_ordens_1.verificarOrdensAtrasadas)();
    });
    node_cron_1.default.schedule('*/30 * * * *', async () => {
        console.log('[Cron] Otimizando alocações...');
        await (0, escalonador_de_tecnicos_1.otimizarAlocacoes)();
    });
    node_cron_1.default.schedule('* * * * *', async () => {
        await (0, disparador_de_notificacoes_1.processarFilaNotificacoes)();
    });
    // Execução inicial
    console.log('[Init] Executando processador inicial...');
    await (0, processador_de_eventos_1.executarProcessador)();
    console.log('✅ Trabalhador em execução contínua.');
}
iniciar().catch(console.error);
