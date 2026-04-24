/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

interface OrdemDetalhe {
  id: number;
  descricao: string;
  resumo_diagnostico: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string;
  veiculo: string;
  tecnico_nome: string | null;
  criado_em: string;
  pagamento_estado: string;
}

export default function AdminOrdemDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ordem, setOrdem] = useState<OrdemDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session?.user?.role !== 'administrador') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'administrador' && params.id) {
      fetchOrdem();
    }
  }, [session, params.id]);

  const fetchOrdem = async () => {
    try {
      const res = await fetch(`/api/admin/ordens/${params.id}`);
      const data = await res.json();
      setOrdem(data);
    } catch (error) {
      console.error('Erro ao carregar ordem', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-300';
      case 'em_andamento': return 'bg-blue-500/20 text-blue-300';
      case 'aguardando_pecas': return 'bg-orange-500/20 text-orange-300';
      case 'concluida': return 'bg-green-500/20 text-green-300';
      case 'cancelada': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) return <div className="text-ice text-center py-12">A carregar...</div>;
  if (!ordem) return <div className="text-ice text-center py-12">Ordem não encontrada</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/modulos/admin/ordens" className="text-ice/70 hover:text-accent">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-ice">Ordem #{ordem.id}</h1>
        <div className="flex-1"></div>
        <button className="text-ice/70 hover:text-accent">
          <Printer size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Gerais */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-ice mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-ice/60">Data de Criação</p>
                <p className="text-ice">{new Date(ordem.criado_em).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-ice/60">Data Agendada</p>
                <p className="text-ice">{ordem.data_agendada ? new Date(ordem.data_agendada).toLocaleDateString('pt-BR') : 'Não agendada'}</p>
              </div>
              <div>
                <p className="text-sm text-ice/60">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ordem.estado)}`}>
                  {ordem.estado === 'pendente' ? 'Pendente' :
                   ordem.estado === 'em_andamento' ? 'Em andamento' :
                   ordem.estado === 'aguardando_pecas' ? 'Aguardando peças' :
                   ordem.estado === 'concluida' ? 'Concluída' : 'Cancelada'}
                </span>
              </div>
              <div>
                <p className="text-sm text-ice/60">Pagamento</p>
                <p className="text-ice">{ordem.pagamento_estado === 'pago' ? 'Pago' : 'Não pago'}</p>
              </div>
            </div>
          </div>

          {/* Descrição e Diagnóstico */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-ice mb-4">Descrição do Problema</h2>
            <p className="text-ice/80">{ordem.descricao}</p>
            {ordem.resumo_diagnostico && (
              <>
                <h2 className="text-lg font-semibold text-ice mt-6 mb-4">Diagnóstico</h2>
                <p className="text-ice/80">{ordem.resumo_diagnostico}</p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-ice mb-4">Cliente</h2>
            <p className="text-ice font-medium">{ordem.cliente_nome}</p>
            <p className="text-ice/80 text-sm">{ordem.cliente_email}</p>
            <p className="text-ice/80 text-sm">{ordem.cliente_telefone}</p>
            <div className="mt-3">
              <p className="text-sm text-ice/60">Veículo</p>
              <p className="text-ice">{ordem.veiculo || 'Não informado'}</p>
            </div>
          </div>

          {/* Técnico */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-ice mb-4">Técnico Responsável</h2>
            <p className="text-ice">{ordem.tecnico_nome || 'Não atribuído'}</p>
          </div>

          {/* Valor */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-ice mb-4">Valor Total</h2>
            <p className="text-2xl font-bold text-accent">
              {ordem.custo_total.toLocaleString('pt-BR', { style: 'currency', currency: 'AOA' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}