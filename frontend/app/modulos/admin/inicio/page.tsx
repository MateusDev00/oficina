'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, Wrench, ClipboardList, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface Stats {
  totalClientes: number;
  totalTecnicos: number;
  totalOrdens: number;
  ordensPendentes: number;
  ordensConcluidas: number;
  ordensAndamento: number;
  faturamentoMensal: { mes: string; total: number }[];
  statusDist: { name: string; value: number }[];
  tecnicosCarga: { nome: string; total: number }[];
}

const COLORS = ['#FFB347', '#2C5364', '#203A43', '#0F2027', '#F8F9FA'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) throw new Error('Erro');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-ice text-center py-12">A carregar dashboard...</div>;
  }

  if (!stats) return <div className="text-ice text-center py-12">Erro ao carregar dados</div>;

  const cards = [
    { title: 'Clientes', value: stats.totalClientes, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Técnicos', value: stats.totalTecnicos, icon: Wrench, color: 'from-green-500 to-green-600' },
    { title: 'Total OS', value: stats.totalOrdens, icon: ClipboardList, color: 'from-purple-500 to-purple-600' },
    { title: 'Pendentes', value: stats.ordensPendentes, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Concluídas', value: stats.ordensConcluidas, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Faturamento', value: `Kz ${stats.faturamentoMensal.reduce((sum, m) => sum + m.total, 0).toLocaleString()}`, icon: DollarSign, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm">{card.title}</p>
                <p className="text-white text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="text-white/60 w-8 h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Mensal */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-ice font-semibold mb-4">Faturamento Mensal (Kz)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.faturamentoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="mes" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#FFB347' }} />
              <Line type="monotone" dataKey="total" stroke="#FFB347" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Estados */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-ice font-semibold mb-4">Status das Ordens</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
              data={stats.statusDist}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
            >
              {stats.statusDist.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Carga dos Técnicos */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20 lg:col-span-2">
          <h3 className="text-ice font-semibold mb-4">Carga de Trabalho dos Técnicos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.tecnicosCarga} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis type="number" stroke="#ccc" />
              <YAxis type="category" dataKey="nome" stroke="#ccc" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#FFB347' }} />
              <Bar dataKey="total" fill="#FFB347" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}