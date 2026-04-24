export type EstadoOrdem = 'pendente' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada';
export type EstadoPagamento = 'nao_pago' | 'pago' | 'estornado';
export type Prioridade = 'baixa' | 'media' | 'alta';
export interface OrdemServico {
    id: number;
    cliente_id: number;
    veiculo_id: number;
    tecnico_id: number | null;
    descricao: string;
    resumo_diagnostico: string | null;
    estado: EstadoOrdem;
    prioridade: Prioridade;
    data_agendada: Date | null;
    iniciado_em: Date | null;
    concluido_em: Date | null;
    custo_total: number;
    estado_pagamento: EstadoPagamento;
    criado_em: Date;
    atualizado_em: Date;
}
export interface OrdemServicoItem {
    id: number;
    ordem_servico_id: number;
    servico_id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    criado_em: Date;
}
export interface OrdemPeca {
    id: number;
    ordem_servico_id: number;
    peca_id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    criado_em: Date;
}
//# sourceMappingURL=utilizadores.d.ts.map