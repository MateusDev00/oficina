/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Log {
  id: number;
  acao: string;
  entidade: string;
  entidade_id: number;
  usuario_nome: string;
  dados_antigos: any;
  dados_novos: any;
  criado_em: string;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/auditoria')
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">A carregar logs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ice">Logs de Auditoria</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-ice/80">
          <thead className="text-xs uppercase bg-black/30 text-ice">
            <tr>
              <th className="px-4 py-2">Data/Hora</th>
              <th className="px-4 py-2">Usuário</th>
              <th className="px-4 py-2">Ação</th>
              <th className="px-4 py-2">Entidade</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-white/10">
                <td className="px-4 py-2">{format(new Date(log.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
                <td className="px-4 py-2">{log.usuario_nome}</td>
                <td className="px-4 py-2">{log.acao}</td>
                <td className="px-4 py-2">{log.entidade}</td>
                <td className="px-4 py-2">{log.entidade_id}</td>
                <td className="px-4 py-2">
                  <details>
                    <summary className="cursor-pointer text-accent">Ver</summary>
                    <pre className="mt-1 text-xs bg-black/50 p-2 rounded">
                      {JSON.stringify({ antes: log.dados_antigos, depois: log.dados_novos }, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}