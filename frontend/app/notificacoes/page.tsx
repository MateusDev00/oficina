'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle, Bell } from 'lucide-react';

interface Notificacao {
  id: number;
  conteudo: string;
  lida: boolean;
  criado_em: string;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notificacoes').then(res => res.json()).then(data => { setNotificacoes(data.notificacoes || []); setLoading(false); }).catch(console.error);
  }, []);

  const marcarLida = async (id: number) => {
    await fetch(`/api/notificacoes/${id}`, { method: 'PATCH' });
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  if (loading) return <div className="text-text-secondary text-center py-12">A carregar...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6"><Bell className="w-6 h-6 text-primary" /><h1 className="text-2xl font-bold text-text">Notificações</h1></div>
      <div className="space-y-3">
        {notificacoes.length === 0 ? <p className="text-text-secondary text-center py-8">Nenhuma notificação encontrada.</p> : notificacoes.map(notif => (
          <div key={notif.id} className={`card p-4 transition ${!notif.lida ? 'border-primary/50' : ''}`}>
            <div className="flex justify-between items-start gap-4"><div className="flex-1"><p className="text-text">{notif.conteudo}</p><p className="text-xs text-text-secondary mt-1">{format(new Date(notif.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}</p></div>
              {!notif.lida && <button onClick={() => marcarLida(notif.id)} className="text-primary hover:text-primary-hover transition"><CheckCircle size={20} /></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}