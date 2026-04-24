/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { Users, Wrench, ClipboardList, DollarSign, TrendingUp, PieChart, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface DashboardStats {
  totalClientes: number;
  totalTecnicos: number;
  totalOrdens: number;
  faturamentoTotal: number;
  faturamentoMensal: { mes: string; total: number }[];
  statusDist: { name: string; value: number }[];
  ordensRecentes: { id: number; descricao: string; estado: string; data_agendada: string; cliente_nome: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Erro ao carregar estatísticas');
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
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const cards = [
    { title: 'Clientes', value: stats?.totalClientes || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: 'Técnicos', value: stats?.totalTecnicos || 0, icon: Wrench, color: 'bg-green-100 text-green-600' },
    { title: 'Ordens', value: stats?.totalOrdens || 0, icon: ClipboardList, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Faturamento', value: `Kz ${stats?.faturamentoTotal?.toLocaleString() || 0}`, icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Faturamento Mensal (Kz)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.faturamentoMensal || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb' }} />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Status das Ordens</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={stats?.statusDist || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(stats?.statusDist || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Últimas Ordens</h3>
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
                      {os.estado}
                    </span>
                  </td>
                  <td className="text-gray-500">{os.data_agendada || '-'}</td>
                </tr>
              ))}
              {(!stats?.ordensRecentes || stats.ordensRecentes.length === 0) && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">Nenhuma ordem encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}