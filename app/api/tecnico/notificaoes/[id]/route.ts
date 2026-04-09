import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tecnico') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  await query('UPDATE notificacoes SET lida = true WHERE id = $1 AND utilizador_id = $2', [
    params.id,
    session.user.id,
  ]);
  return NextResponse.json({ success: true });
}