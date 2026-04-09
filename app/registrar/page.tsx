'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, telefone, password }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Erro ao registar');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep to-teal p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-deep font-bold text-xl">LPN</span>
          </div>
          <h1 className="text-2xl font-bold text-ice">Criar Conta</h1>
          <p className="text-ice/80 text-sm mt-1">Registe-se para aceder aos serviços</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ice mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 text-sm bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ice mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ice mb-1">Telefone (+244...)</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full p-2 text-sm bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ice mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-sm bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice"
              required
            />
          </div>
          {error && <p className="text-red-300 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-sm bg-accent text-deep rounded-lg font-bold hover:bg-orange-500 transition disabled:opacity-50 shadow-md"
          >
            {loading ? 'A processar...' : 'Registar'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/20 text-center">
          <p className="text-ice/80 text-sm">
            Já tem conta?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Entrar
            </Link>
          </p>
          <div className="mt-2">
            <Link
              href="/"
              className="text-xs text-ice/60 hover:text-accent transition"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}