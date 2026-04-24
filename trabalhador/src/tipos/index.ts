export type TipoEvento =
  | 'ORDEM_CRIADA'
  | 'ORDEM_ATRASADA'
  | 'PAGAMENTO_CONFIRMADO'
  | 'TECNICO_INDISPONIVEL'
  | 'ORDEM_CONCLUIDA'
  | 'AGENDAMENTO_ALTERADO'
  | 'CLIENTE_NOTIFICADO'
  | 'REAGENDAMENTO_AUTOMATICO';

export interface EventoPayload {
  ordem_id?: number;
  cliente_id?: number;
  tecnico_id?: number;
  veiculo_id?: number;
  data_agendada?: string;
  prioridade?: 'baixa' | 'media' | 'alta';
  dias_atraso?: number;
  pagamento_id?: number;
  valor?: number;
  acao?: string;
  total?: number;
  [key: string]: any;
}

export interface Evento {
  id: number;
  tipo: TipoEvento;
  payload: EventoPayload;
  processado: boolean;
  tentativas: number;
  ultimo_erro: string | null;
  criado_em: Date;
  processado_em: Date | null;
}

export interface AcaoDecisao {
  tipo: 'notificar_cliente' | 'reagendar_ordem' | 'priorizar_ordem' | 'sugerir_tecnico' | 'realocar_ordens';
  parametros: Record<string, any>;
}

export interface DecisaoAgente {
  resolvido: boolean;
  acoes: AcaoDecisao[];
  justificativa?: string;
}