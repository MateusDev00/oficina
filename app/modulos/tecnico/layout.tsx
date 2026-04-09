import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, ClipboardList, Calendar, Bell } from 'lucide-react';
import MobileMenuToggle from '@/components/MobileMenuToggle';
import SidebarCloseButton from '@/components/SidebarCloseButton';

export default async function TecnicoLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tecnico') redirect('/login');

  return (
    <div className="min-h-screen bg-gray-100">
      <MobileMenuToggle />
      <div className="flex min-h-screen">
        <aside id="sidebar" className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform -translate-x-full lg:translate-x-0 transition-transform duration-300">
          <div className="flex justify-end lg:hidden p-4"><SidebarCloseButton /></div>
          <div className="p-6">
            <div className="mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <span className="text-white font-bold text-xl">LPN</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Olá, {session.user.name}</h2>
              <p className="text-gray-500 text-sm">Técnico</p>
            </div>
            <nav className="space-y-2">
              <Link href="/modulos/tecnico/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"><LayoutDashboard size={20} /> Dashboard</Link>
              <Link href="/modulos/tecnico/ordens" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"><ClipboardList size={20} /> Minhas OS</Link>
              <Link href="/modulos/tecnico/agenda" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"><Calendar size={20} /> Agenda</Link>
            </nav>
            <div className="absolute bottom-6 left-6">
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="flex items-center gap-2 text-gray-500 hover:text-primary transition"><LogOut size={20} /> Sair</button>
              </form>
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex justify-end items-center gap-4">
            <Link href="/modulos/tecnico/notificacoes" className="text-gray-500 hover:text-primary transition"><Bell size={20} /></Link>
          </header>
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}