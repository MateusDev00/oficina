import { query } from '../configuracao/base_de_dados';

export async function processarFilaNotificacoes(): Promise<void> {
  try {
    const notificacoes = await query(
      `SELECT n.id, n.utilizador_id, n.canal, n.conteudo, u.telefone
       FROM notificacoes n
       JOIN utilizadores u ON n.utilizador_id = u.id
       WHERE n.estado = 'pendente'
       LIMIT 20`
    );

    for (const not of notificacoes.rows) {
      try {
        // Simulação de envio - aqui entraria integração real com WhatsApp/Email
        console.log(`Enviando notificação ${not.id} para ${not.telefone}: ${not.conteudo}`);

        // Marca como enviado
        await query(`UPDATE notificacoes SET estado = 'enviado', enviado_em = NOW() WHERE id = $1`, [not.id]);
      } catch (erro: any) {
        console.error(`Falha ao enviar notificação ${not.id}:`, erro.message);
        await query(`UPDATE notificacoes SET estado = 'falhou', ultimo_erro = $1 WHERE id = $2`, [erro.message, not.id]);
      }
    }
  } catch (erro) {
    console.error('Erro no disparador de notificações:', erro);
  }
}