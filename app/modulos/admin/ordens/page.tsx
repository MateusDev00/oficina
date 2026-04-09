'use client';
import { useEffect, useState } from 'react';
import { Search, X, Eye } from 'lucide-react';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  cliente_nome: string;
  tecnico_nome: string;
}

export default function AdminOrdensPage() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrdens();
  }, []);

  const fetchOrdens = async () => {
    try {
      const res = await fetch('/api/admin/ordens');
      const data = await res.json();
      setOrdens(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = ordens.filter(o => {
    if (statusFilter && o.estado !== statusFilter) return false;
    if (search && !o.descricao.toLowerCase().includes(search.toLowerCase()) && !o.cliente_nome?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-500/20 text-yellow-300',
      em_andamento: 'bg-blue-500/20 text-blue-300',
      aguardando_pecas: 'bg-orange-500/20 text-orange-300',
      concluida: 'bg-green-500/20 text-green-300',
      cancelada: 'bg-red-500/20 text-red-300',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ice mb-6">Gestão de Ordens de Serviço</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/20">
          <Search size={18} className="text-ice/60" />
          <input type="text" placeholder="Buscar por descrição ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent flex-1 outline-none text-ice placeholder:text-ice/50" />
          {search && <button onClick={() => setSearch('')} className="text-ice/60 hover:text-ice"><X size={16} /></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-black/30 backdrop-blur-md rounded-lg p-2 border border-white/20 text-ice">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="aguardando_pecas">Aguardando peças</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {loading ? <div className="text-ice text-center py-12">A carregar...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/20 text-ice/70 text-sm">
              <tr><th>ID</th><th>Cliente</th><th>Descrição</th><th>Status</th><th>Data Agendada</th><th>Custo Total</th><th>Técnico</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.map(os => (
                <tr key={os.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 text-ice">#{os.id}</td>
                  <td className="py-3 text-ice/80">{os.cliente_nome}</td>
                  <td className="py-3 text-ice/80 max-w-xs truncate">{os.descricao}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(os.estado)}`}>{os.estado.replace('_', ' ')}</span></td>
                  <td className="py-3 text-ice/80">{os.data_agendada || '-'}</td>
                  <td className="py-3 text-ice/80">{os.custo_total?.toLocaleString()} Kz</td>
                  <td className="py-3 text-ice/80">{os.tecnico_nome || '-'}</td>
                  <td className="py-3"><button className="text-ice/70 hover:text-accent"><Eye size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}