// app/modulos/cliente/ordens/page.tsx
'use client';
import { useEffect, useState } from 'react';

interface Ordem {
  id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  custo_total: number;
}

export default function ClienteOrdens() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ordens/cliente')
      .then(res => res.json())
      .then(data => {
        setOrdens(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-ice mb-6">Minhas Ordens de Serviço</h1>
      {loading ? (
        <p className="text-ice/60">A carregar...</p>
      ) : ordens.length === 0 ? (
        <p className="text-ice/60">Nenhuma ordem encontrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/30 border-b border-white/20">
              <tr>
                <th className="p-3 text-ice">ID</th>
                <th className="p-3 text-ice">Descrição</th>
                <th className="p-3 text-ice">Status</th>
                <th className="p-3 text-ice">Data Agendada</th>
                <th className="p-3 text-ice">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map(os => (
                <tr key={os.id} className="border-b border-white/10">
                  <td className="p-3 text-ice">{os.id}</td>
                  <td className="p-3 text-ice">{os.descricao}</td>
                  <td className="p-3 text-ice">{os.estado}</td>
                  <td className="p-3 text-ice">{os.data_agendada}</td>
                  <td className="p-3 text-ice">{os.custo_total} Kz</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}