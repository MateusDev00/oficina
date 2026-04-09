import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { threadId } = await params; 

  const messages = await query(
    `SELECT direcao, conteudo, criado_em
     FROM interacoes
     WHERE utilizador_id = $1 AND thread_id = $2
     ORDER BY criado_em ASC`,
    [session.user.id, threadId]
  );

  return NextResponse.json(messages.rows);
}