// ============================================================
// TIPOS GLOBAIS DO SISTEMA DE GESTÃO DE MANUTENÇÃO TÉCNICA
// ============================================================

import { Request } from 'express';

// --------------------- ENUMS / UNION TYPES ---------------------
export type TipoUsuario = 'cliente' | 'tecnico' | 'administrador';
export type EstadoOrdem = 'pendente' | 'em_andamento' | 'aguardando_pecas' | 'concluida' | 'cancelada';
export type EstadoPagamento = 'nao_pago' | 'pago' | 'estornado';
export type MetodoPagamento = 'multicaixa' | 'dinheiro_movel' | 'cartao' | 'numerario';
export type Prioridade = 'baixa' | 'media' | 'alta';
export type CanalNotificacao = 'whatsapp' | 'sms' | 'email';
export type DirecaoInteracao = 'entrada' | 'saida';

// --------------------- ENTIDADES PRINCIPAIS ---------------------
export interface Utilizador {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  hash_senha: string;
  papel: TipoUsuario;
  especialidade: string | null;
  disponivel: boolean;
  endereco: string | null;
  metodo_contacto_preferido: string;
  criado_em: Date;
  atualizado_em: Date;
}

export interface Veiculo {
  id: number;
  cliente_id: number;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  criado_em: Date;
  atualizado_em: Date;
}

export interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  preco_base: number;
  duracao_estimada_minutos: number;
  criado_em: Date;
  atualizado_em: Date;
}

export interface Peca {
  id: number;
  nome: string;
  descricao: string | null;
  quantidade: number;
  preco_unitario: number;
  nivel_reposicao: number;
  criado_em: Date;
  atualizado_em: Date;
}

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

export interface Pagamento {
  id: number;
  ordem_servico_id: number;
  valor: number;
  metodo: MetodoPagamento;
  referencia_gateway: string | null;
  estado: string;
  id_transacao: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface Notificacao {
  id: number;
  utilizador_id: number;
  canal: string;
  conteudo: string;
  estado: string;
  enviado_em: Date | null;
  criado_em: Date;
}

export interface Interacao {
  id: number;
  utilizador_id: number;
  tecnico_atendente_id: number | null;
  direcao: DirecaoInteracao;
  conteudo: string;
  metadados: Record<string, any> | null;
  criado_em: Date;
}

export interface DisponibilidadeTecnico {
  id: number;
  tecnico_id: number;
  data: Date;
  disponivel: boolean;
  observacao: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

export interface HorarioFuncionamento {
  id: number;
  dia_semana: string;
  abertura: string;
  fechamento: string;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// --------------------- SISTEMA DE EVENTOS ---------------------
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
  prioridade?: Prioridade;
  dias_atraso?: number;
  pagamento_id?: number;
  valor?: number;
  acao?: string;
  total?: number;
  tipo_notificacao?: string;
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

// --------------------- AGENTE INTELIGENTE ---------------------
export interface AcaoDecisao {
  tipo: 'notificar_cliente' | 'reagendar_ordem' | 'priorizar_ordem' | 'sugerir_tecnico' | 'realocar_ordens';
  parametros: Record<string, any>;
}

export interface DecisaoAgente {
  resolvido: boolean;
  acoes: AcaoDecisao[];
  justificativa?: string;
}

// --------------------- AUTENTICAÇÃO ---------------------
export interface DecodedToken {
  id: number;
  papel: TipoUsuario;
  iat?: number;
  exp?: number;
}

// --------------------- TIPOS AUXILIARES PARA O EXPRESS ---------------------
export interface RequestAutenticado extends Request {
  utilizador?: Utilizador;
}

// --------------------- LOGS / AUDITORIA ---------------------
export interface LogAuditoria {
  id: number;
  utilizador_id: number | null;
  acao: string;
  entidade: string | null;
  entidade_id: number | null;
  detalhes: Record<string, any> | null;
  ip: string | null;
  criado_em: Date;
}

// --------------------- REAGENDAMENTOS ---------------------
export interface ReagendamentoAuto {
  id: number;
  ordem_servico_id: number;
  data_original: Date;
  data_reagendada: Date;
  motivo: string;
  criado_em: Date;
}

// --------------------- MEMÓRIA DO UTILIZADOR (RAG) ---------------------
export interface MemoriaUsuario {
  id: number;
  utilizador_id: number;
  conteudo: string;
  embedding: number[] | null;
  criado_em: Date;
}