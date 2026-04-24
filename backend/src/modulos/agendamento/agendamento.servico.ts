import { Request, Response } from 'express';
import { query } from '../../configuracao/base_de_dados';
import { emitirEvento } from '../../nucleo/eventos/emissor_de_eventos';
import { RequestAutenticado } from '../../intermediarios/autenticacao';

class AgendamentoServico {
  async verificarDisponibilidade(req: Request, res: Response): Promise<void> {
    const { data } = req.query;
    
    const dataObj = new Date(data as string);
    const diaSemana = dataObj.getDay();
    const diasSemanaPt = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaSemanaNome = diasSemanaPt[diaSemana];
    
    const horarioResult = await query(
      'SELECT * FROM horario_funcionamento WHERE dia_semana = $1 AND ativo = true',
      [diaSemanaNome]
    );
    
    if (horarioResult.rows.length === 0) {
      res.json({ disponivel: false, motivo: 'Oficina fechada neste dia' });
      return;
    }
    
    const tecnicosResult = await query(
      `SELECT COUNT(*) as total 
       FROM disponibilidade_tecnico dt
       JOIN utilizadores u ON dt.tecnico_id = u.id
       WHERE dt.data = $1 AND dt.disponivel = true AND u.disponivel = true`,
      [data]
    );
    
    const totalTecnicos = parseInt(tecnicosResult.rows[0].total, 10);
    const vagasDisponiveis = totalTecnicos * 3;
    
    const ordensResult = await query(
      'SELECT COUNT(*) as total FROM ordens_servico WHERE data_agendada = $1',
      [data]
    );
    
    const ordensAgendadas = parseInt(ordensResult.rows[0].total, 10);
    
    res.json({
      disponivel: ordensAgendadas < vagasDisponiveis,
      vagas_restantes: Math.max(0, vagasDisponiveis - ordensAgendadas),
      horario_funcionamento: horarioResult.rows[0]
    });
  }

  async criarAgendamento(req: RequestAutenticado, res: Response): Promise<void> {
    const { cliente_id, veiculo_id, descricao, data_agendada, hora_agendada, servicos_ids } = req.body;
    
    const cliente = await query('SELECT id FROM utilizadores WHERE id = $1', [cliente_id]);
    if (cliente.rows.length === 0) {
      res.status(400).json({ mensagem: 'Cliente nao encontrado' });
      return;
    }
    
    const veiculo = await query('SELECT id FROM veiculos WHERE id = $1 AND cliente_id = $2', [veiculo_id, cliente_id]);
    if (veiculo.rows.length === 0) {
      res.status(400).json({ mensagem: 'Veiculo nao encontrado ou nao pertence ao cliente' });
      return;
    }
    
    const ordemResult = await query(
      `INSERT INTO ordens_servico (cliente_id, veiculo_id, descricao, data_agendada, estado, prioridade)
       VALUES ($1, $2, $3, $4, 'pendente', 'media')
       RETURNING *`,
      [cliente_id, veiculo_id, descricao, data_agendada]
    );
    
    const ordem = ordemResult.rows[0];
    
    if (servicos_ids && servicos_ids.length > 0) {
      for (const servicoId of servicos_ids) {
        await query(
          `INSERT INTO ordem_servicos (ordem_servico_id, servico_id, quantidade, preco_unitario)
           SELECT $1, $2, 1, preco_base FROM servicos WHERE id = $2`,
          [ordem.id, servicoId]
        );
      }
    }
    
    await emitirEvento('ORDEM_CRIADA', {
      ordem_id: ordem.id,
      cliente_id,
      veiculo_id,
      data_agendada
    });
    
    res.status(201).json({
      mensagem: 'Agendamento criado com sucesso',
      ordem
    });
  }

  async listarTecnicosDisponiveis(_req: Request, res: Response): Promise<void> {
    const hoje = new Date().toISOString().split('T')[0];
    const result = await query(
      `SELECT u.id, u.nome, u.especialidade 
       FROM disponibilidade_tecnico dt
       JOIN utilizadores u ON dt.tecnico_id = u.id
       WHERE dt.data = $1 AND dt.disponivel = true AND u.disponivel = true`,
      [hoje]
    );
    res.json(result.rows);
  }
}

export default new AgendamentoServico();