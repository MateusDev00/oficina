/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { Eye, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  cliente_nome: string;
  resumo_diagnostico?: string;
}

export default function TecnicoOrdensPage() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOS, setSelectedOS] = useState<Ordem | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [novoEstado, setNovoEstado] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filtro, setFiltro] = useState('todas');

  const fetchOrdens = async () => {
    try {
      const res = await fetch('/api/tecnico/ordens');
      if (!res.ok) throw new Error('Erro ao carregar ordens');
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
      if (!res.ok) throw new Error('Erro ao atualizar');
      setSelectedOS(null);
      setDiagnostico('');
      setNovoEstado('');
      fetchOrdens();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar ordem');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = ordens.filter(os => {
    if (filtro === 'pendentes') return os.estado !== 'concluida' && os.estado !== 'cancelada';
    if (filtro === 'concluidas') return os.estado === 'concluida';
    return true;
  });

  const getStatusBadge = (estado: string) => {
    if (estado === 'pendente') return 'badge-warning';
    if (estado === 'em_andamento') return 'badge-primary';
    if (estado === 'aguardando_pecas') return 'badge-warning';
    if (estado === 'concluida') return 'badge-success';
    return 'badge-danger';
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minhas Ordens de Serviço</h1>
        <button onClick={fetchOrdens} className="btn-outline flex items-center gap-2"><RefreshCw size={16} /> Actualizar</button>
      </div>

      {/* Filtros */}
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
        {filtered.map(os => (
          <div key={os.id} className="card p-4 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">OS #{os.id}</h3>
                  <span className={`badge ${getStatusBadge(os.estado)}`}>{os.estado.replace('_', ' ')}</span>
                </div>
                <p className="text-gray-600 text-sm mb-1">{os.descricao}</p>
                <p className="text-gray-500 text-sm">Cliente: {os.cliente_nome}</p>
                <p className="text-gray-500 text-sm">Agendada: {os.data_agendada || 'Não agendada'}</p>
                {os.resumo_diagnostico && <p className="text-gray-500 text-sm mt-1">Diagnóstico: {os.resumo_diagnostico}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedOS(os); setDiagnostico(os.resumo_diagnostico || ''); setNovoEstado(os.estado); }}
                  className="btn-outline flex items-center gap-1"
                >
                  <Eye size={16} /> Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-400 py-8">Nenhuma ordem encontrada.</div>}
      </div>

      {/* Modal de atualização */}
      {selectedOS && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">OS #{selectedOS.id}</h2>
            <p className="text-gray-500 mb-4">Cliente: {selectedOS.cliente_nome}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico / Observações</label>
                <textarea rows={3} value={diagnostico} onChange={e => setDiagnostico(e.target.value)} className="input w-full" placeholder="Adicione um diagnóstico..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alterar Status</label>
                <select value={novoEstado} onChange={e => setNovoEstado(e.target.value)} className="input w-full">
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="aguardando_pecas">Aguardando peças</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setSelectedOS(null)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button onClick={handleUpdate} disabled={updating} className="btn-primary">{updating ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}