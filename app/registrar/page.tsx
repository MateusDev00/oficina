'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';

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
      <div className="w-full max-w-sm bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-deep font-bold text-xl">LPN</span>
          </div>
          <h1 className="text-2xl font-bold text-ice">Criar Conta</h1>
          <p className="text-ice/70 text-sm mt-1">Registe-se para aceder aos serviços</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ice/80 mb-1">Nome completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice text-sm placeholder:text-ice/40"
                placeholder="Seu nome"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ice/80 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice text-sm placeholder:text-ice/40"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ice/80 mb-1">Telefone (+244...)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice text-sm placeholder:text-ice/40"
                placeholder="+244 900 000 001"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ice/80 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-ice text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-300 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-accent text-deep rounded-lg font-bold text-sm hover:bg-orange-500 transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            <UserPlus size={16} /> {loading ? 'A processar...' : 'Registar'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/20 text-center">
          <p className="text-ice/70 text-xs">
            Já tem conta?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Entrar
            </Link>
          </p>
          <div className="mt-2">
            <Link
              href="/"
              className="text-xs text-ice/50 hover:text-accent transition"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}