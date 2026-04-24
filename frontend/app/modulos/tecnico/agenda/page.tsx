/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Agendamento {
  id: number;
  descricao: string;
  data_agendada: string;
  cliente_nome: string;
  estado: string;
}

export default function TecnicoAgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch('/api/tecnico/agenda');
        if (!res.ok) throw new Error('Erro ao carregar agenda');
        const data = await res.json();
        setAgendamentos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgenda();
  }, []);

  const filtered = agendamentos.filter(a => {
    if (filtro === 'concluidas') return a.estado === 'concluida';
    if (filtro === 'pendentes') return a.estado !== 'concluida' && a.estado !== 'cancelada';
    return true;
  });

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Minha Agenda</h1>
      <div className="flex gap-2 mb-4">
        {['todas', 'pendentes', 'concluidas'].map(op => (
          <button
            key={op}
            onClick={() => setFiltro(op)}
            className={`px-3 py-1 rounded-full text-sm ${filtro === op ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {op === 'todas' ? 'Todas' : op === 'pendentes' ? 'Pendentes' : 'Concluídas'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map(a => (
          <div key={a.id} className="card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              <div>
                <p className="font-medium text-gray-800">{a.data_agendada || 'Data não definida'}</p>
                <p className="text-gray-600 text-sm">{a.descricao}</p>
                <p className="text-gray-500 text-sm">Cliente: {a.cliente_nome}</p>
              </div>
            </div>
            <span className={`badge ${a.estado === 'concluida' ? 'badge-success' : 'badge-warning'}`}>
              {a.estado === 'concluida' ? <CheckCircle size={14} /> : <Clock size={14} />} {a.estado.replace('_', ' ')}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-8">Nenhum agendamento encontrado.</div>}
      </div>
    </div>
  );
}