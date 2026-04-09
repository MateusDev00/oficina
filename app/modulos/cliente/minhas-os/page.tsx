/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  resumo_diagnostico?: string;
}

export default function ClienteMinhasOSPage() {
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minhas Ordens de Serviço</h1>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-outline flex items-center gap-2">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>
      {ordens.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 mb-4">Nenhuma ordem de serviço encontrada.</p>
          <Link href="/modulos/cliente/chat"><button className="btn-primary">Solicitar Serviço</button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordens.map(os => (
            <div key={os.id} className="card p-4 hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">OS #{os.id}</h3>
                    <span className={`badge ${os.estado === 'concluida' ? 'badge-success' : os.estado === 'pendente' ? 'badge-warning' : 'badge-primary'}`}>
                      {os.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{os.descricao}</p>
                  <p className="text-gray-500 text-sm">Data agendada: {os.data_agendada || 'Não agendada'}</p>
                  {os.resumo_diagnostico && <p className="text-gray-500 text-sm mt-1">Diagnóstico: {os.resumo_diagnostico}</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{os.custo_total?.toLocaleString()} Kz</p>
                  {os.estado !== 'concluida' && (
                    <Link href="/modulos/cliente/chat">
                      <button className="text-primary text-sm hover:underline mt-1">Acompanhar</button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}