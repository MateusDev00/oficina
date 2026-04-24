export type EstadoOrdem = 'pendente' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada';
export type Prioridade = 'baixa' | 'media' | 'alta';

export interface OrdemServico {
  id: number;
  cliente_id: number;
  veiculo_id: number;
  tecnico_id: number | null;
  descricao: string;
  estado: EstadoOrdem;
  prioridade: Prioridade;
  data_agendada: string | null;
  custo_total: number;
  criado_em: string;
}

export interface Utilizador {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  papel: 'cliente' | 'tecnico' | 'administrador';
}