/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { Eye, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '@/components/Modal'; // criar componente simples

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  cliente_nome: string;
  resumo_diagnostico?: string;
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
  const map: Record<string, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em andamento',
    aguardando_pecas: 'Aguardando peças',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };
  return map[status] || status;
}

export default function TecnicoOrdensPage() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOS, setSelectedOS] = useState<Ordem | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [novoEstado, setNovoEstado] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrdens = async () => {
    try {
      const res = await fetch('/api/tecnico/ordens');
      const data = await res.json();
      setOrdens(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, []);

  const handleUpdate = async () => {
    if (!selectedOS) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/tecnico/ordens/${selectedOS.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: novoEstado, resumo_diagnostico: diagnostico }),
      });
      if (res.ok) {
        setSelectedOS(null);
        setDiagnostico('');
        setNovoEstado('');
        fetchOrdens();
      } else {
        alert('Erro ao atualizar');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusActions = (estado: string) => {
    switch (estado) {
      case 'pendente':
        return ['em_andamento'];
      case 'em_andamento':
        return ['aguardando_pecas', 'concluida'];
      case 'aguardando_pecas':
        return ['em_andamento', 'concluida'];
      default:
        return [];
    }
  };

  const getStatusName = (estado: string) => {
    const map: Record<string, string> = {
      pendente: 'Pendente',
      em_andamento: 'Em andamento',
      aguardando_pecas: 'Aguardando peças',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
    };
    return map[estado] || estado;
  };

  if (loading) return <div className="text-ice text-center py-12">A carregar...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ice mb-6">Minhas Ordens de Serviço</h1>

      <div className="space-y-4">
        {ordens.length === 0 ? (
          <p className="text-ice/60">Nenhuma ordem atribuída.</p>
        ) : (
          ordens.map(os => (
            <div key={os.id} className="bg-black/30 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-black/40 transition">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-ice">OS #{os.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(os.estado)}`}>
                      {getStatusName(os.estado)}
                    </span>
                  </div>
                  <p className="text-ice/80 text-sm mb-1">{os.descricao}</p>
                  <p className="text-ice/60 text-sm">Cliente: {os.cliente_nome}</p>
                  <p className="text-ice/60 text-sm">Agendada: {os.data_agendada || 'Não agendada'}</p>
                  {os.resumo_diagnostico && (
                    <p className="text-ice/60 text-sm mt-2">Diagnóstico: {os.resumo_diagnostico}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOS(os);
                      setDiagnostico(os.resumo_diagnostico || '');
                      setNovoEstado('');
                    }}
                    className="p-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de atualização */}
      {selectedOS && (
        <Modal onClose={() => setSelectedOS(null)}>
          <h2 className="text-xl font-bold text-ice mb-4">Atualizar OS #{selectedOS.id}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-ice/80 text-sm mb-1">Diagnóstico / Observações</label>
              <textarea
                rows={4}
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice"
              />
            </div>
            <div>
              <label className="block text-ice/80 text-sm mb-1">Alterar status</label>
              <select
                value={novoEstado}
                onChange={(e) => setNovoEstado(e.target.value)}
                className="w-full p-2 bg-black/30 rounded-lg border border-white/20 text-ice"
              >
                <option value="">Selecione um novo status</option>
                {getStatusActions(selectedOS.estado).map(status => (
                  <option key={status} value={status}>{getStatusName(status)}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOS(null)}
                className="px-4 py-2 text-ice/70 hover:text-ice"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-accent text-deep rounded-lg hover:bg-orange-500 transition disabled:opacity-50"
              >
                {updating ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}