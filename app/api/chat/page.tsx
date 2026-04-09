import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ChatRedirect() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'cliente') redirect('/modulos/cliente/chat');
  if (session.user.role === 'tecnico') redirect('/modulos/tecnico/chat');
  if (session.user.role === 'administrador') redirect('/modulos/admin/chat');
  redirect('/');
}