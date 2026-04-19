'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

interface DashboardStats {
  total_os: number;
  pendentes: number;
  em_andamento: number;
  concluidas: number;
  aguardando_pecas: number;
  ordensRecentes: {
    id: number;
    descricao: string;
    estado: string;
    data_agendada: string;
    cliente_nome: string;
  }[];
  statusDist: { name: string; value: number }[];
}

export default function TecnicoDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tecnico/dashboard');
      if (!res.ok) throw new Error('Erro ao carregar dashboard');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { title: 'Total de OS', value: stats?.total_os || 0, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
    { title: 'Pendentes', value: stats?.pendentes || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Em andamento', value: stats?.em_andamento || 0, icon: AlertCircle, color: 'bg-orange-100 text-orange-600' },
    { title: 'Concluídas', value: stats?.concluidas || 0, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard do Técnico</h1>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-outline flex items-center gap-2">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Distribuição de Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.statusDist || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(stats?.statusDist || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Ordens por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.statusDist || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ordens recentes */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Últimas Ordens Atribuídas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 text-gray-500 text-sm">
              <tr><th className="pb-2">ID</th><th className="pb-2">Cliente</th><th className="pb-2">Descrição</th><th className="pb-2">Status</th><th className="pb-2">Data</th></tr>
            </thead>
            <tbody>
              {stats?.ordensRecentes?.map((os) => (
                <tr key={os.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">#{os.id}</td>
                  <td className="text-gray-600">{os.cliente_nome}</td>
                  <td className="text-gray-600 max-w-xs truncate">{os.descricao}</td>
                  <td>
                    <span className={`badge ${os.estado === 'concluida' ? 'badge-success' : os.estado === 'pendente' ? 'badge-warning' : 'badge-primary'}`}>
                      {os.estado.replace('_', ' ')}
                    </span>
                   </td>
                  <td className="text-gray-500">{os.data_agendada || '-'}</td>
                </tr>
              ))}
              {(!stats?.ordensRecentes || stats.ordensRecentes.length === 0) && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">Nenhuma ordem atribuída</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}