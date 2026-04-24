/* eslint-disable @typescript-eslint/no-unused-vars */
// app/modulos/admin/horarios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Horario {
  abertura: string;
  fechamento: string;
}

type HorariosSemana = {
  [key: string]: Horario | null;
};

const diasSemana = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export default function GerenciarHorariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [horarios, setHorarios] = useState<HorariosSemana>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== 'administrador') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchHorarios();
  }, []);

  const fetchHorarios = async () => {
    try {
      const res = await fetch('/api/admin/horarios');
      const data = await res.json();
      if (res.ok) {
        setHorarios(data);
      } else {
        toast.error(data.error || 'Erro ao carregar horários');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (dia: string, campo: 'abertura' | 'fechamento', valor: string) => {
    setHorarios(prev => {
      const novo = { ...prev };
      if (!novo[dia]) {
        novo[dia] = { abertura: '09:00', fechamento: '18:00' };
      }
      novo[dia] = { ...novo[dia]!, [campo]: valor };
      return novo;
    });
  };

  const toggleDia = (dia: string, ativo: boolean) => {
    setHorarios(prev => {
      const novo = { ...prev };
      if (ativo) {
        novo[dia] = { abertura: '09:00', fechamento: '18:00' };
      } else {
        delete novo[dia];
      }
      return novo;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/horarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarios),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Horários atualizados com sucesso');
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">Horário de Funcionamento</h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 space-y-4"
      >
        {diasSemana.map((dia) => {
          const ativo = !!horarios[dia.key];
          return (
            <div key={dia.key} className="border-b border-white/20 pb-4 last:border-0">
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer w-32">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => toggleDia(dia.key, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">{dia.label}</span>
                </label>
                {ativo && (
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <label className="block text-xs text-ice/60">Abertura</label>
                      <input
                        type="time"
                        value={horarios[dia.key]?.abertura || '09:00'}
                        onChange={(e) => handleChange(dia.key, 'abertura', e.target.value)}
                        className="bg-black/30 border border-white/20 rounded-lg p-2 text-ice"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ice/60">Fechamento</label>
                      <input
                        type="time"
                        value={horarios[dia.key]?.fechamento || '18:00'}
                        onChange={(e) => handleChange(dia.key, 'fechamento', e.target.value)}
                        className="bg-black/30 border border-white/20 rounded-lg p-2 text-ice"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-deep rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar horários'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}