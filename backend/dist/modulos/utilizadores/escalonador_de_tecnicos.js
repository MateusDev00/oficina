"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_de_dados_1 = require("../../configuracao/base_de_dados");
const emissor_de_eventos_1 = require("../../nucleo/eventos/emissor_de_eventos");
exports.default = {
    async otimizarAlocacoes() {
        const hoje = new Date().toISOString().split('T')[0];
        // Ordens pendentes sem técnico atribuído, ordenadas por prioridade e data
        const ordensResult = await (0, base_de_dados_1.query)(`SELECT id, prioridade, data_agendada FROM ordens_servico 
       WHERE tecnico_id IS NULL AND estado = 'pendente'
       ORDER BY 
         CASE prioridade WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
         data_agendada ASC NULLS LAST`);
        const tecnicosResult = await (0, base_de_dados_1.query)(`SELECT u.id, u.nome, COUNT(o.id) as carga
       FROM utilizadores u
       LEFT JOIN ordens_servico o ON u.id = o.tecnico_id AND o.estado IN ('pendente', 'em_andamento')
       WHERE u.papel = 'tecnico' AND u.disponivel = true
       GROUP BY u.id
       ORDER BY carga ASC`);
        if (tecnicosResult.rows.length === 0) {
            console.log('Nenhum técnico disponível para alocação');
            return;
        }
        for (const ordem of ordensResult.rows) {
            const tecnico = tecnicosResult.rows.shift();
            if (!tecnico)
                break;
            await (0, base_de_dados_1.query)('UPDATE ordens_servico SET tecnico_id = $1 WHERE id = $2', [tecnico.id, ordem.id]);
            tecnicosResult.rows.push(tecnico); // round-robin
            console.log(`Ordem ${ordem.id} atribuída ao técnico ${tecnico.id}`);
        }
        if (ordensResult.rows.length > 0) {
            await (0, emissor_de_eventos_1.emitirEvento)('AGENDAMENTO_ALTERADO', { acao: 'alocacao_automatica', total: ordensResult.rows.length });
        }
    }
};
//# sourceMappingURL=escalonador_de_tecnicos.js.map