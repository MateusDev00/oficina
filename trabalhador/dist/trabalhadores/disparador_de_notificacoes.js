"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processarFilaNotificacoes = processarFilaNotificacoes;
const base_de_dados_1 = require("../configuracao/base_de_dados");
async function processarFilaNotificacoes() {
    try {
        const notificacoes = await (0, base_de_dados_1.query)(`SELECT n.id, n.utilizador_id, n.canal, n.conteudo, u.telefone
       FROM notificacoes n
       JOIN utilizadores u ON n.utilizador_id = u.id
       WHERE n.estado = 'pendente'
       LIMIT 20`);
        for (const not of notificacoes.rows) {
            try {
                // Simulação de envio - aqui entraria integração real com WhatsApp/Email
                console.log(`Enviando notificação ${not.id} para ${not.telefone}: ${not.conteudo}`);
                // Marca como enviado
                await (0, base_de_dados_1.query)(`UPDATE notificacoes SET estado = 'enviado', enviado_em = NOW() WHERE id = $1`, [not.id]);
            }
            catch (erro) {
                console.error(`Falha ao enviar notificação ${not.id}:`, erro.message);
                await (0, base_de_dados_1.query)(`UPDATE notificacoes SET estado = 'falhou', ultimo_erro = $1 WHERE id = $2`, [erro.message, not.id]);
            }
        }
    }
    catch (erro) {
        console.error('Erro no disparador de notificações:', erro);
    }
}
