// hooks/useNotificacoes.ts
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Notificacao {
  id: number;
  conteudo: string;
  criado_em: string;
}

export function useNotificacoes(ultimoId: number = 0) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  useEffect(() => {
    const fetchNotificacoes = async () => {
      try {
        const res = await fetch(`/api/notificacoes?ultimoId=${ultimoId}`);
        const data = await res.json();
        if (data.notificacoes?.length) {
          setNotificacoes(prev => [...prev, ...data.notificacoes]);
          // Exibir toast para cada nova notificação
          data.notificacoes.forEach((n: Notificacao) => {
            toast(n.conteudo);
          });
        }
      } catch (error) {
        console.error('Erro ao buscar notificações', error);
      }
    };

    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 5000);
    return () => clearInterval(interval);
  }, [ultimoId]);

  return { notificacoes };
}