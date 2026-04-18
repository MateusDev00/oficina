import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, MessageSquare, ClipboardList, Bell } from 'lucide-react';
import MobileMenuToggle from '@/components/MobileMenuToggle';
import SidebarCloseButton from '@/components/SidebarCloseButton';

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'cliente') redirect('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep to-teal">
      <MobileMenuToggle />
      <div className="flex min-h-screen">
        {/* Sidebar escura */}
        <aside
          id="sidebar"
          className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-black/30 backdrop-blur-md border-r border-white/20 transform -translate-x-full lg:translate-x-0 transition-transform duration-300"
        >
          <div className="flex justify-end lg:hidden p-4">
            <SidebarCloseButton />
          </div>
          <div className="p-6">
            <div className="mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange-400 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <span className="text-deep font-bold text-xl">LPN</span>
              </div>
              <h2 className="text-xl font-bold text-ice">Olá, {session.user.name}</h2>
              <p className="text-ice/60 text-sm">Cliente</p>
            </div>
            <nav className="space-y-2">
              <Link
                href="/modulos/cliente/dashboard"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice"
              >
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link
                href="/modulos/cliente/chat"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice"
              >
                <MessageSquare size={20} /> Agente
              </Link>
              <Link
                href="/modulos/cliente/minhas-os"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition text-ice"
              >
                <ClipboardList size={20} /> Minhas OS
              </Link>
            </nav>
            <div className="absolute bottom-6 left-6">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-ice/60 hover:text-accent transition"
                >
                  <LogOut size={20} /> Sair
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-black/30 backdrop-blur-md border-b border-white/20 p-4 flex justify-end items-center gap-4">
            <Link href="/modulos/cliente/notificacoes" className="text-ice/70 hover:text-accent transition">
              <Bell size={20} />
            </Link>
          </header>
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}