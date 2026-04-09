// app/modulos/tecnico/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, ClipboardList, Calendar } from 'lucide-react';

export default async function TecnicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'tecnico') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep to-teal">
      <div className="flex">
        <aside className="w-64 bg-black/30 backdrop-blur-md min-h-screen p-6 border-r border-white/20">
          <div className="mb-8">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
              <span className="text-deep font-bold text-xl">LPN</span>
            </div>
            <h2 className="text-xl font-bold text-ice">Olá, {session.user.name}</h2>
            <p className="text-ice/60 text-sm">Técnico</p>
          </div>
          <nav className="space-y-2">
            <Link href="/modulos/tecnico/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
              <User size={20} /> Dashboard
            </Link>
            <Link href="/modulos/tecnico/ordens" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
              <ClipboardList size={20} /> Minhas OS
            </Link>
            <Link href="/modulos/tecnico/agenda" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice">
              <Calendar size={20} /> Agenda
            </Link>
          </nav>
          <div className="absolute bottom-6 left-6">
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-2 text-ice/70 hover:text-accent transition">
                <LogOut size={20} /> Sair
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}