"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_de_dados_1 = require("../../configuracao/base_de_dados");
exports.default = {
    async processarFila() {
        const notificacoes = await (0, base_de_dados_1.query)(`SELECT n.*, u.telefone, u.metodo_contacto_preferido
       FROM notificacoes n
       JOIN utilizadores u ON n.utilizador_id = u.id
       WHERE n.estado = 'pendente'
       LIMIT 20`);
        for (const not of notificacoes.rows) {
            try {
                // Simulação de envio (substituir por integração real com WhatsApp/Email)
                console.log(`Enviando notificação para ${not.telefone}: ${not.conteudo}`);
                // Exemplo de chamada a API de WhatsApp
                // await axios.post(process.env.WHATSAPP_API_URL!, { to: not.telefone, message: not.conteudo });
                await (0, base_de_dados_1.query)(`UPDATE notificacoes SET estado = 'enviado', enviado_em = NOW() WHERE id = $1`, [not.id]);
            }
            catch (erro) {
                console.error(`Falha ao enviar notificação ${not.id}:`, erro);
                await (0, base_de_dados_1.query)(`UPDATE notificacoes SET estado = 'falhou', ultimo_erro = $1 WHERE id = $2`, [erro.message, not.id]);
            }
        }
    }
};
//# sourceMappingURL=disparador_de_notificacoes.js.map