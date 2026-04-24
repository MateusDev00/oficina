import cron from 'node-cron';
import { testarConexaoRedis } from './configuracao/redis';
import { query } from './configuracao/base_de_dados';
import { executarProcessador } from './trabalhadores/processador_de_eventos';
import { verificarOrdensAtrasadas } from './trabalhadores/monitor_de_ordens';
import { otimizarAlocacoes } from './trabalhadores/escalonador_de_tecnicos';
import { processarFilaNotificacoes } from './trabalhadores/disparador_de_notificacoes';

async function iniciar() {
  console.log('🚀 Iniciando Trabalhador Autónomo da Oficina LPN...');

  // Testar conexão com PostgreSQL
  try {
    const resultado = await query('SELECT NOW() as agora');
    console.log(`✅ PostgreSQL conectado (${resultado.rows[0].agora})`);
  } catch (erro) {
    console.error('❌ PostgreSQL indisponível. Encerrando.');
    console.error((erro as Error).message);
    process.exit(1);
  }

  // Testar conexão com Redis (Upstash)
  const redisOk = await testarConexaoRedis();
  if (redisOk) {
    console.log('✅ Redis (Upstash) conectado.');
  } else {
    console.warn('⚠️ Redis indisponível. Funcionalidades de eventos serão limitadas.');
  }

  // Agendar tarefas recorrentes
  // Processador de eventos: a cada 5 segundos
  cron.schedule('*/5 * * * * *', async () => {
    await executarProcessador();
  });

  // Monitor de ordens atrasadas: todos os dias às 8h
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Verificando ordens atrasadas...');
    await verificarOrdensAtrasadas();
  });

  // Escalonador de técnicos: a cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron] Otimizando alocações de técnicos...');
    await otimizarAlocacoes();
  });

  // Disparador de notificações: a cada minuto
  cron.schedule('* * * * *', async () => {
    await processarFilaNotificacoes();
  });

  // Executa o processador de eventos imediatamente ao iniciar
  console.log('[Init] Executando processador de eventos inicial...');
  await executarProcessador();

  console.log('✅ Trabalhador em execução contínua.');

  // Graceful shutdown
  const encerrar = () => {
    console.log('\n🛑 Encerrando trabalhador graciosamente...');
    process.exit(0);
  };
  process.on('SIGTERM', encerrar);
  process.on('SIGINT', encerrar);
}

iniciar().catch((erro) => {
  console.error('Erro fatal ao iniciar trabalhador:', erro);
  process.exit(1);
});