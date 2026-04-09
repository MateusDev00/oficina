/* eslint-disable react-hooks/set-state-in-effect */
// app/modulos/cliente/pagamento/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PagamentoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get('transactionId');
  const [status, setStatus] = useState('carregando');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!transactionId) {
      setError('Transação não identificada.');
      setStatus('erro');
      return;
    }

    // Opcional: buscar detalhes da transação via API
    const fetchTransaction = async () => {
      const res = await fetch(`/api/payment/status?transactionId=${transactionId}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data.estado);
      } else {
        setError(data.error);
        setStatus('erro');
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const handlePagar = async () => {
    // Chama o endpoint de pagamento para efetivar (simular)
    const res = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });
    if (res.ok) {
      setStatus('pago');
      setTimeout(() => router.push('/modulos/cliente/dashboard'), 2000);
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  if (status === 'carregando') return <div className="text-ice">Carregando...</div>;
  if (status === 'pago') return <div className="text-ice text-center py-12">Pagamento confirmado! Redirecionando...</div>;
  if (status === 'erro') return <div className="text-red-400 text-center py-12">Erro: {error}</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-black/30 backdrop-blur-md rounded-xl border border-white/20">
      <h1 className="text-2xl font-bold text-ice mb-4">Pagamento Pendente</h1>
      <p className="text-ice/80 mb-6">Transação #{transactionId}</p>
      <button
        onClick={handlePagar}
        className="w-full bg-accent text-deep py-2 rounded-lg font-bold hover:bg-orange-500 transition"
      >
        Simular Pagamento
      </button>
    </div>
  );
}