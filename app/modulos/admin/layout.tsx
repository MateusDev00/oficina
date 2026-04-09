import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MobileMenuToggle from '@/components/MobileMenuToggle';
import NotificacaoSinoAdmin from '@/components/NotificacaoSinoAdmin';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'administrador') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep to-teal">
      <MobileMenuToggle />
      <div className="flex min-h-screen">
        <AdminSidebar userName={session.user.name || 'Admin'} />
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-black/30 backdrop-blur-md border-b border-white/20 p-4 flex justify-end items-center gap-4">
            <NotificacaoSinoAdmin />
          </header>
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}