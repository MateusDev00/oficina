'use client';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface Agendamento {
  id: number;
  descricao: string;
  data_agendada: string;
  cliente_nome: string;
  estado: string;
}

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    pendente: 'bg-yellow-500/20 text-yellow-300',
    em_andamento: 'bg-blue-500/20 text-blue-300',
    aguardando_pecas: 'bg-orange-500/20 text-orange-300',
    concluida: 'bg-green-500/20 text-green-300',
    cancelada: 'bg-red-500/20 text-red-300',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-300';
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em andamento',
    aguardando_pecas: 'Aguardando peças',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };
  return labels[status] || status;
}

export default function TecnicoAgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch('/api/tecnico/agenda');
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

  if (loading) return <div className="text-ice text-center py-12">A carregar...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ice mb-6">Minha Agenda</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setFiltro('todas')} className={`px-3 py-1 rounded-lg text-sm ${filtro === 'todas' ? 'bg-accent text-deep' : 'bg-white/10 text-ice'}`}>Todas</button>
        <button onClick={() => setFiltro('pendentes')} className={`px-3 py-1 rounded-lg text-sm ${filtro === 'pendentes' ? 'bg-accent text-deep' : 'bg-white/10 text-ice'}`}>Pendentes</button>
        <button onClick={() => setFiltro('concluidas')} className={`px-3 py-1 rounded-lg text-sm ${filtro === 'concluidas' ? 'bg-accent text-deep' : 'bg-white/10 text-ice'}`}>Concluídas</button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ice/60">Nenhum agendamento encontrado.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-accent" />
                  <span className="text-ice font-medium">{a.data_agendada || 'Data não definida'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(a.estado)}`}>
                    {formatStatus(a.estado)}
                  </span>
                </div>
                <p className="text-ice/90">{a.descricao}</p>
                <p className="text-ice/60 text-sm">Cliente: {a.cliente_nome}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}