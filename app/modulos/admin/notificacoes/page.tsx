'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';

interface Notificacao {
  id: number;
  conteudo: string;
  lida: boolean;
  criado_em: string;
}

export default function AdminNotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const fetchNotificacoes = async () => {
    try {
      const res = await fetch('/api/admin/notificacoes');
      const data = await res.json();
      setNotificacoes(data.notificacoes || []);
    } catch (error) {
      console.error('Erro ao carregar notificações', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: number) => {
    try {
      await fetch(`/api/admin/notificacoes/${id}`, { method: 'PATCH' });
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) {
      console.error('Erro ao marcar como lida', error);
    }
  };

  if (loading) return <div className="text-ice text-center py-12">A carregar...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-ice mb-6">Notificações</h1>
      <div className="space-y-3">
        {notificacoes.length === 0 ? (
          <p className="text-ice/60 text-center py-8">Nenhuma notificação encontrada.</p>
        ) : (
          notificacoes.map(notif => (
            <div
              key={notif.id}
              className={`bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/20 transition ${!notif.lida ? 'border-accent/50' : ''}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-ice">{notif.conteudo}</p>
                  <p className="text-xs text-ice/40 mt-1">
                    {format(new Date(notif.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                  </p>
                </div>
                {!notif.lida && (
                  <button
                    onClick={() => marcarComoLida(notif.id)}
                    className="text-accent hover:text-orange-400 transition"
                    title="Marcar como lida"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}