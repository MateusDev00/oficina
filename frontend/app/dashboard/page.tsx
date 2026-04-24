import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (session.user.role === 'administrador') redirect('/modulos/admin/dashboard');
  if (session.user.role === 'tecnico') redirect('/modulos/tecnico/dashboard');
  redirect('/modulos/cliente/dashboard');
}