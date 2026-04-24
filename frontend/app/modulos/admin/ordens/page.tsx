'use client';
import { useEffect, useState } from 'react';
import { Search, X, Eye, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  cliente_nome: string;
  tecnico_nome: string;
  resumo_diagnostico?: string;
}

export default function AdminOrdensPage() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOS, setSelectedOS] = useState<Ordem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [novoStatus, setNovoStatus] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrdens = async () => {
    try {
      const res = await fetch('/api/admin/ordens');
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

  const handleUpdateStatus = async () => {
    if (!selectedOS) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/ordens/${selectedOS.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: novoStatus, resumo_diagnostico: diagnostico }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      setSelectedOS(null);
      setNovoStatus('');
      setDiagnostico('');
      fetchOrdens();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar ordem');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = ordens.filter(o => {
    if (statusFilter && o.estado !== statusFilter) return false;
    if (search && !o.descricao.toLowerCase().includes(search.toLowerCase()) && !o.cliente_nome?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'badge-warning',
      em_andamento: 'badge-primary',
      aguardando_pecas: 'badge-warning',
      concluida: 'badge-success',
      cancelada: 'badge-danger',
    };
    return colors[status] || 'badge';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pendente') return <Clock size={14} />;
    if (status === 'concluida') return <CheckCircle size={14} />;
    return <AlertCircle size={14} />;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Ordens de Serviço</h1>
        <button onClick={fetchOrdens} className="btn-outline flex items-center gap-2"><RefreshCw size={16} /> Actualizar</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 card p-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-transparent flex-1 outline-none text-gray-700"
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>}
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="input"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="aguardando_pecas">Aguardando peças</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 text-gray-500 text-sm">
            <tr><th className="pb-2">ID</th><th className="pb-2">Cliente</th><th className="pb-2">Descrição</th><th className="pb-2">Status</th><th className="pb-2">Data</th><th className="pb-2">Custo</th><th className="pb-2">Técnico</th><th className="pb-2">Ações</th></tr>
          </thead>
          <tbody>
            {paginated.map(os => (
              <tr key={os.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">#{os.id}</td>
                <td className="text-gray-600">{os.cliente_nome}</td>
                <td className="text-gray-600 max-w-xs truncate">{os.descricao}</td>
                <td><span className={`badge ${getStatusBadge(os.estado)} flex items-center gap-1 w-fit`}>{getStatusIcon(os.estado)} {os.estado.replace('_', ' ')}</span></td>
                <td className="text-gray-500">{os.data_agendada || '-'}</td>
                <td className="text-gray-600">{os.custo_total?.toLocaleString()} Kz</td>
                <td className="text-gray-600">{os.tecnico_nome || '-'}</td>
                <td>
                  <button onClick={() => { setSelectedOS(os); setNovoStatus(os.estado); setDiagnostico(os.resumo_diagnostico || ''); }} className="text-gray-400 hover:text-primary">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && <tr><td colSpan={8} className="py-4 text-center text-gray-400">Nenhuma ordem encontrada</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Anterior</button>
          <span className="px-3 py-1 text-gray-600">Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Próxima</button>
        </div>
      )}

      {/* Modal de detalhes/atualização */}
      {selectedOS && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">OS #{selectedOS.id}</h2>
            <p className="text-gray-500 mb-4">Cliente: {selectedOS.cliente_nome}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea rows={3} value={selectedOS.descricao} readOnly className="input w-full bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico / Observações</label>
                <textarea rows={3} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} className="input w-full" placeholder="Adicione um diagnóstico..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alterar Status</label>
                <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="input w-full">
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="aguardando_pecas">Aguardando peças</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setSelectedOS(null)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button onClick={handleUpdateStatus} disabled={updating} className="btn-primary">{updating ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}