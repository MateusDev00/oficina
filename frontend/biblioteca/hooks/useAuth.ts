'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/servicos/api';

interface Utilizador {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  papel: 'cliente' | 'tecnico' | 'administrador';
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [utilizador, setUtilizador] = useState<Utilizador | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      setTokenState(saved);
      verificar(saved);
    } else {
      setCarregando(false);
    }
  }, []);

  const verificar = async (t: string) => {
    try {
      const { valido } = await api.verificarToken(t);
      if (!valido) throw new Error('Inválido');
      // O token é válido; o utilizador já foi guardado no login
    } catch {
      logout();
    } finally {
      setCarregando(false);
    }
  };

  const login = async (telefone: string, senha: string) => {
    const { token: novoToken, utilizador: user } = await api.login(telefone, senha);
    localStorage.setItem('token', novoToken);
    setTokenState(novoToken);
    setUtilizador(user);
    return user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setTokenState(null);
    setUtilizador(null);
  }, []);

  return { token, utilizador, login, logout, carregando };
}