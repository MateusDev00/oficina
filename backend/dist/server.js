"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const ambiente_1 = require("./configuracao/ambiente");
const base_de_dados_1 = require("./configuracao/base_de_dados");
const redis_1 = require("./configuracao/redis");
async function iniciarServidor() {
    try {
        const dbOk = await (0, base_de_dados_1.testarConexao)();
        if (!dbOk) {
            console.error('❌ PostgreSQL indisponível. Encerrando.');
            process.exit(1);
        }
        console.log('✅ PostgreSQL conectado.');
        const redisOk = await (0, redis_1.testarConexaoRedis)();
        if (redisOk) {
            console.log('✅ Redis (Upstash) conectado.');
            // Só inicia tarefas agendadas se o Redis estiver funcional
            // iniciarTodasTarefas();
        }
        else {
            console.warn('⚠️ Redis indisponível. Funcionalidades de cache/eventos desativadas.');
        }
        const server = app_1.default.listen(ambiente_1.PORTA, () => {
            console.log(`🚀 Servidor rodando na porta ${ambiente_1.PORTA}`);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => server.close(() => process.exit(0)));
        process.on('SIGINT', () => server.close(() => process.exit(0)));
    }
    catch (erro) {
        console.error('Erro fatal:', erro);
        process.exit(1);
    }
}
iniciarServidor();
//# sourceMappingURL=server.js.map