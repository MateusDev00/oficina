 'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
}

export default function ClienteDashboard() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ordens/cliente')
      .then(res => res.json())
      .then(data => {
        setOrdens(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-ice mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-ice mb-4">Bem-vindo!</h2>
          <p className="text-ice/80 mb-4">
            Acompanhe as suas ordens de serviço e tire dúvidas com o nosso agente inteligente.
          </p>
          <Link href="/modulos/cliente/chat">
            <button className="bg-accent text-deep px-4 py-2 rounded-lg font-medium hover:bg-orange-500 transition">
              Falar com Agente
            </button>
          </Link>
        </div>
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-ice mb-4">Últimas Ordens</h2>
          {loading ? (
            <p className="text-ice/60">A carregar...</p>
          ) : ordens.length === 0 ? (
            <p className="text-ice/60">Nenhuma ordem encontrada.</p>
          ) : (
            <ul className="space-y-2">
              {ordens.map(os => (
                <li key={os.id} className="border-b border-white/10 pb-2">
                  <p className="text-ice">{os.descricao}</p>
                  <p className="text-sm text-ice/60">Status: {os.estado} | Data: {os.data_agendada} | Valor: {os.custo_total} Kz</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/modulos/cliente/ordens" className="text-accent text-sm mt-2 inline-block">
            Ver todas →
          </Link>
        </div>
      </div>
    </div>
  );
}