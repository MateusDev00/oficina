'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, CheckCircle, Clock, AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
}

export default function ClienteDashboard() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrdens = async () => {
    try {
      const res = await fetch('/api/ordens/cliente');
      if (!res.ok) throw new Error('Erro ao carregar ordens');
      const data = await res.json();
      setOrdens(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrdens();
  };

  const total = ordens.length;
  const pendentes = ordens.filter(o => o.estado !== 'concluida' && o.estado !== 'cancelada').length;
  const concluidas = ordens.filter(o => o.estado === 'concluida').length;
  const andamento = ordens.filter(o => o.estado === 'em_andamento').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ice">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="border border-accent text-accent px-4 py-2 rounded-lg hover:bg-accent hover:text-deep transition flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Cards com estilo escuro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-ice/70 text-sm">Total OS</p>
            <p className="text-2xl font-bold text-ice">{total}</p>
          </div>
          <ClipboardList className="text-accent w-8 h-8" />
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-ice/70 text-sm">Pendentes</p>
            <p className="text-2xl font-bold text-warning">{pendentes}</p>
          </div>
          <Clock className="text-warning w-8 h-8" />
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-ice/70 text-sm">Em andamento</p>
            <p className="text-2xl font-bold text-accent">{andamento}</p>
          </div>
          <AlertCircle className="text-accent w-8 h-8" />
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-ice/70 text-sm">Concluídas</p>
            <p className="text-2xl font-bold text-success">{concluidas}</p>
          </div>
          <CheckCircle className="text-success w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bem‑vindo */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-ice mb-4">Bem-vindo!</h2>
          <p className="text-ice/70 mb-4">
            Acompanhe as suas ordens de serviço e tire dúvidas com o nosso agente inteligente.
          </p>
          <Link href="/modulos/cliente/chat">
            <button className="bg-accent text-deep px-4 py-2 rounded-lg font-bold hover:bg-orange-500 transition flex items-center gap-2">
              <MessageSquare size={18} /> Falar com Agente
            </button>
          </Link>
        </div>

        {/* Últimas Ordens */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-ice mb-4">Últimas Ordens</h2>
          {ordens.length === 0 ? (
            <p className="text-ice/50">Nenhuma ordem encontrada.</p>
          ) : (
            <ul className="space-y-2">
              {ordens.slice(0, 5).map(os => (
                <li key={os.id} className="border-b border-white/10 pb-2">
                  <p className="text-ice font-medium">{os.descricao}</p>
                  <p className="text-sm text-ice/60">
                    Status: {os.estado} | Data: {os.data_agendada || '-'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/modulos/cliente/minhas-os" className="text-accent text-sm mt-2 inline-block hover:underline">
            Ver todas →
          </Link>
        </div>
      </div>
    </div>
  );
}