'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle, Bell, RefreshCw } from 'lucide-react';

interface Notificacao {
  id: number;
  conteudo: string;
  lida: boolean;
  criado_em: string;
}

export default function ClienteNotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotificacoes = async () => {
    try {
      const res = await fetch('/api/tecnico/notificacoes');
      if (!res.ok) throw new Error('Erro ao carregar notificações');
      const data = await res.json();
      setNotificacoes(data.notificacoes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNotificacoes(); }, []);

  const marcarLida = async (id: number) => {
    try {
      await fetch(`/api/cliente/notificacoes/${id}`, { method: 'PATCH' });
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (error) { console.error(error); }
  };

  const marcarTodasLidas = async () => {
    const naoLidas = notificacoes.filter(n => !n.lida);
    for (const n of naoLidas) await marcarLida(n.id);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Bell size={24} /> Notificações</h1>
        <div className="flex gap-2">
          <button onClick={marcarTodasLidas} className="btn-outline text-sm">Marcar todas como lidas</button>
          <button onClick={() => { setRefreshing(true); fetchNotificacoes(); }} className="btn-outline flex items-center gap-1"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Actualizar</button>
        </div>
      </div>
      <div className="space-y-3">
        {notificacoes.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">Nenhuma notificação encontrada.</div>
        ) : (
          notificacoes.map(n => (
            <div key={n.id} className={`card p-4 transition ${!n.lida ? 'border-l-4 border-l-primary' : ''}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-gray-800">{n.conteudo}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(n.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}</p>
                </div>
                {!n.lida && <button onClick={() => marcarLida(n.id)} className="text-primary hover:text-primary-hover"><CheckCircle size={20} /></button>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}