import app from './app';
import { PORTA } from './configuracao/ambiente';
import { testarConexao } from './configuracao/base_de_dados';
import { testarConexaoRedis } from './configuracao/redis';

async function iniciarServidor(): Promise<void> {
  try {
    const dbOk = await testarConexao();
    if (!dbOk) {
      console.error('❌ PostgreSQL indisponível. Encerrando.');
      process.exit(1);
    }
    console.log('✅ PostgreSQL conectado.');

    const redisOk = await testarConexaoRedis();
    if (redisOk) {
      console.log('✅ Redis (Upstash) conectado.');
      // Só inicia tarefas agendadas se o Redis estiver funcional
      // iniciarTodasTarefas();
    } else {
      console.warn('⚠️ Redis indisponível. Funcionalidades de cache/eventos desativadas.');
    }

    const server = app.listen(PORTA, () => {
      console.log(`🚀 Servidor rodando na porta ${PORTA}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => server.close(() => process.exit(0)));
    process.on('SIGINT', () => server.close(() => process.exit(0)));
  } catch (erro) {
    console.error('Erro fatal:', erro);
    process.exit(1);
  }
}

iniciarServidor();