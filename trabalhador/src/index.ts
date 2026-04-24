import cron from 'node-cron';
import { testarConexaoRedis } from './configuracao/redis';
import { query } from './configuracao/base_de_dados';
import { executarProcessador } from './trabalhadores/processador_de_eventos';
import { verificarOrdensAtrasadas } from './trabalhadores/monitor_de_ordens';
import { otimizarAlocacoes } from './trabalhadores/escalonador_de_tecnicos';
import { processarFilaNotificacoes } from './trabalhadores/disparador_de_notificacoes';

async function iniciar() {
  console.log('🚀 Iniciando Trabalhador Autónomo da Oficina LPN...');

  // Testar e aguardar PostgreSQL com retry
  let dbOk = false;
  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    try {
      const resultado = await query('SELECT NOW() as agora');
      console.log(`✅ PostgreSQL conectado (${resultado.rows[0].agora})`);
      dbOk = true;
      break;
    } catch (erro: any) {
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
  const redisOk = await testarConexaoRedis();
  if (redisOk) {
    console.log('✅ Redis (Upstash) conectado.');
  } else {
    console.warn('⚠️ Redis indisponível.');
  }

  // Agendar tarefas
  cron.schedule('*/5 * * * * *', async () => {
    await executarProcessador();
  });

  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Verificando ordens atrasadas...');
    await verificarOrdensAtrasadas();
  });

  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron] Otimizando alocações...');
    await otimizarAlocacoes();
  });

  cron.schedule('* * * * *', async () => {
    await processarFilaNotificacoes();
  });

  // Execução inicial
  console.log('[Init] Executando processador inicial...');
  await executarProcessador();

  console.log('✅ Trabalhador em execução contínua.');
}

iniciar().catch(console.error);