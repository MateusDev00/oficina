// services/api.ts (frontend - adaptado para apontar para o novo backend)
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token'); // ou obtido do contexto de autenticacao

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.mensagem || 'Erro na requisicao');
  }
  return res.json();
}

export const ordensAPI = {
  listar: () => fetchAPI('/api/ordens'),
  criar: (dados: any) => fetchAPI('/api/ordens', { method: 'POST', body: JSON.stringify(dados) }),
};