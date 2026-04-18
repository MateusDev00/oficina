'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email ou senha inválidos');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/me');
    const user = await res.json();
    if (user.role === 'administrador') router.push('/modulos/admin/dashboard');
    else if (user.role === 'tecnico') router.push('/modulos/tecnico/dashboard');
    else router.push('/modulos/cliente/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep to-teal p-4">
      <div className="w-full max-w-sm bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-deep font-bold text-xl">LPN</span>
          </div>
          <h1 className="text-2xl font-bold text-ice">Bem-vindo</h1>
          <p className="text-ice/70 text-sm mt-1">Aceda à sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ice/80 mb-1">E-mail</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
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
            <LogIn size={16} /> {loading ? 'A processar...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/20 text-center">
          <p className="text-ice/70 text-xs">
            Ainda não tem conta?{' '}
            <Link href="/registrar" className="text-accent hover:underline font-medium">
              Registre-se
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