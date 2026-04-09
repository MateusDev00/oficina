'use client';
import { useEffect, useState } from 'react';

interface Ordem {
  id: number;
  cliente_id: number;
  descricao: string;
  estado: string;
  data_agendada: string;
  prioridade: string;
}

export default function TecnicoDashboard() {
  const [ordens, setOrdens] = useState<Ordem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ordens/tecnico')
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

  const atualizarStatus = async (id: number, novoEstado: string) => {
    const res = await fetch(`/api/ordens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: novoEstado }),
    });
    if (res.ok) {
      setOrdens(ordens.map(os => os.id === id ? { ...os, estado: novoEstado } : os));
    } else {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-ice mb-6">Minhas Ordens</h1>
      {loading ? (
        <p className="text-ice/60">A carregar...</p>
      ) : ordens.length === 0 ? (
        <p className="text-ice/60">Nenhuma ordem atribuída.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ordens.map(os => (
            <div key={os.id} className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-ice">{os.descricao}</h3>
                  <p className="text-sm text-ice/60">Cliente ID: {os.cliente_id} | Data: {os.data_agendada}</p>
                  <p className="text-sm text-ice/60">Prioridade: {os.prioridade}</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={os.estado}
                    onChange={(e) => atualizarStatus(os.id, e.target.value)}
                    className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm text-ice"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="aguardando_pecas">Aguardando peças</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}