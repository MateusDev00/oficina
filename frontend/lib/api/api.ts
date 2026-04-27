// lib/api/api.ts
// Serviço centralizado de chamadas à API do backend Express

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface OpcoesRequisicao extends RequestInit {
  token?: string;
}

async function fetchAPI<T = any>(endpoint: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { token, ...rest } = opcoes;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...rest.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers,
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || 'Erro na requisição');
  }

  return resposta.json();
}

export const api = {
  // ---------------------------------- Autenticação ----------------------------------
  login: (telefone: string, senha: string) =>
    fetchAPI<{ token: string; utilizador: any }>('/autenticacao/login', {
      method: 'POST',
      body: JSON.stringify({ telefone, senha }),
    }),

  registro: (dados: { nome: string; telefone: string; senha: string; email?: string }) =>
    fetchAPI<{ mensagem: string; id: number }>('/autenticacao/registro', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  verificarToken: (token: string) =>
    fetchAPI<{ valido: boolean }>('/autenticacao/verificar', { token }),

  solicitarRecuperacaoSenha: (telefone: string) =>
    fetchAPI<{ mensagem: string }>('/autenticacao/recuperar-senha', {
      method: 'POST',
      body: JSON.stringify({ telefone }),
    }),

  redefinirSenha: (token: string, novaSenha: string) =>
    fetchAPI<{ mensagem: string }>('/autenticacao/redefinir-senha', {
      method: 'POST',
      body: JSON.stringify({ token, novaSenha }),
    }),

  // ---------------------------------- Utilizadores ----------------------------------
  listarUtilizadores: (token: string) =>
    fetchAPI('/utilizadores', { token }),

  obterUtilizador: (id: number, token: string) =>
    fetchAPI(`/utilizadores/${id}`, { token }),

  atualizarUtilizador: (id: number, dados: any, token: string) =>
    fetchAPI(`/utilizadores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
      token,
    }),

  atualizarDisponibilidade: (id: number, disponivel: boolean, token: string) =>
    fetchAPI(`/utilizadores/${id}/disponibilidade`, {
      method: 'PATCH',
      body: JSON.stringify({ disponivel }),
      token,
    }),

  removerUtilizador: (id: number, token: string) =>
    fetchAPI(`/utilizadores/${id}`, {
      method: 'DELETE',
      token,
    }),

  // ---------------------------------- Ordens de Serviço ----------------------------------
  listarOrdens: (token: string) =>
    fetchAPI('/ordens', { token }),

  obterOrdem: (id: number, token: string) =>
    fetchAPI(`/ordens/${id}`, { token }),

  criarOrdem: (dados: any, token: string) =>
    fetchAPI('/ordens', {
      method: 'POST',
      body: JSON.stringify(dados),
      token,
    }),

  atualizarStatusOrdem: (id: number, estado: string, resumoDiagnostico?: string, token?: string) =>
    fetchAPI(`/ordens/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, resumo_diagnostico: resumoDiagnostico }),
      token,
    }),

  atribuirTecnico: (id: number, tecnico_id: number, token: string) =>
    fetchAPI(`/ordens/${id}/tecnico`, {
      method: 'PATCH',
      body: JSON.stringify({ tecnico_id }),
      token,
    }),

  registarPagamento: (id: number, dadosPagamento: any, token: string) =>
    fetchAPI(`/ordens/${id}/pagamento`, {
      method: 'POST',
      body: JSON.stringify(dadosPagamento),
      token,
    }),

  // ---------------------------------- Agendamento ----------------------------------
  verificarDisponibilidade: (data: string, token: string) =>
    fetchAPI(`/agendamento/disponibilidade?data=${data}`, { token }),

  criarAgendamento: (dados: any, token: string) =>
    fetchAPI('/agendamento', {
      method: 'POST',
      body: JSON.stringify(dados),
      token,
    }),

  listarTecnicosDisponiveis: (token: string) =>
    fetchAPI('/agendamento/tecnicos', { token }),

  // ---------------------------------- Notificações ----------------------------------
  listarNotificacoes: (token: string) =>
    fetchAPI('/notificacoes', { token }),

  marcarNotificacaoLida: (id: number, token: string) =>
    fetchAPI(`/notificacoes/${id}/lida`, {
      method: 'PATCH',
      token,
    }),

  reenviarNotificacao: (id: number, token: string) =>
    fetchAPI(`/notificacoes/${id}/reenviar`, {
      method: 'POST',
      token,
    }),

  // ---------------------------------- Pagamentos ----------------------------------
  listarPagamentos: (token: string) =>
    fetchAPI('/pagamentos', { token }),

  obterPagamento: (id: number, token: string) =>
    fetchAPI(`/pagamentos/${id}`, { token }),

  // ---------------------------------- Agente Inteligente ----------------------------------
  enviarMensagemAgente: (mensagem: string, token: string, contexto?: any) =>
    fetchAPI<{ resposta: string }>('/agente/conversa', {
      method: 'POST',
      body: JSON.stringify({ mensagem, contexto_usuario: contexto || {} }),
      token,
    }),
};