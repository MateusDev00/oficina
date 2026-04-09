/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notificacao {
  id: number;
  conteudo: string;
  lida: boolean;
  criado_em: string;
}

export default function NotificacoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    const fetchNotificacoes = async () => {
      const res = await fetch('/api/notificacoes');
      const data = await res.json();
      setNotificacoes(data.notificacoes || []);
      setLoading(false);
    };
    fetchNotificacoes();
  }, []);

  const marcarTodas = async () => {
    await fetch('/api/notificacoes', { method: 'PATCH' });
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  if (loading) return <div className="p-8 text-center">A carregar notificações...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ice">Notificações</h1>
        {notificacoes.some(n => !n.lida) && (
          <button
            onClick={marcarTodas}
            className="text-sm text-accent hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {notificacoes.length === 0 ? (
        <p className="text-ice/60 text-center">Nenhuma notificação.</p>
      ) : (
        <div className="space-y-3">
          {notificacoes.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-lg border ${n.lida ? 'bg-black/20 border-white/10' : 'bg-accent/10 border-accent/30'}`}
            >
              <p className="text-ice">{n.conteudo}</p>
              <p className="text-xs text-ice/50 mt-2">
                {formatDistanceToNow(new Date(n.criado_em), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}