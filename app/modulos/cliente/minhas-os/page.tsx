'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
  resumo_diagnostico?: string;
}

export default function MinhasOSPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session?.user?.role !== 'cliente') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchOrdens = async () => {
      try {
        const res = await fetch('/api/ordens/cliente');
        const data = await res.json();
        setOrdens(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrdens();
  }, [session]);

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep to-teal"><div className="text-ice">A carregar...</div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ice mb-6">Minhas Ordens de Serviço</h1>
      {ordens.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
          <p className="text-ice/80">Nenhuma ordem de serviço encontrada.</p>
          <Link href="/modulos/cliente/chat"><button className="mt-4 bg-accent text-deep px-4 py-2 rounded-lg hover:bg-orange-500 transition">Solicitar Serviço</button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordens.map((os) => (
            <div key={os.id} className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-black/40 transition">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-ice mb-2">{os.descricao}</h3>
                  <p className="text-ice/80 text-sm mb-2"><span className="font-medium">Status:</span> <span className={os.estado === 'concluida' ? 'text-success' : os.estado === 'em_andamento' ? 'text-accent' : 'text-warning'}>{os.estado === 'pendente' ? 'Pendente' : os.estado === 'em_andamento' ? 'Em andamento' : os.estado === 'aguardando_pecas' ? 'Aguardando peças' : os.estado === 'concluida' ? 'Concluída' : 'Cancelada'}</span></p>
                  <p className="text-ice/80 text-sm"><span className="font-medium">Data agendada:</span> {os.data_agendada || 'Não agendada'}</p>
                  {os.resumo_diagnostico && <p className="text-ice/80 text-sm mt-2"><span className="font-medium">Diagnóstico:</span> {os.resumo_diagnostico}</p>}
                </div>
                <div className="text-right"><p className="text-2xl font-bold text-accent">{os.custo_total} Kz</p>{os.estado !== 'concluida' && <Link href={`/modulos/cliente/chat?os=${os.id}`}><button className="mt-2 text-sm text-accent hover:underline">Acompanhar</button></Link>}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}