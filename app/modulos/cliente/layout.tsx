import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'cliente') redirect('/login');

  return (
    <SessionProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-deep to-teal">
        <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/20">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/modulos/cliente/dashboard" className="text-ice font-bold text-xl">Oficina LPN</Link>
            <nav className="flex gap-6 items-center">
              <Link href="/modulos/cliente/dashboard" className="text-ice hover:text-accent">Dashboard</Link>
              <Link href="/modulos/cliente/chat" className="text-ice hover:text-accent">Agente</Link>
              <Link href="/modulos/cliente/minhas-os" className="text-ice hover:text-accent">Minhas OS</Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </SessionProviderWrapper>
  );
}