import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const threads = await query(
    `SELECT thread_id, MAX(criado_em) as ultima_atividade,
            (SELECT conteudo FROM interacoes i2
             WHERE i2.thread_id = i.thread_id
             ORDER BY criado_em DESC LIMIT 1) as ultima_mensagem
     FROM interacoes i
     WHERE utilizador_id = $1 AND thread_id IS NOT NULL
     GROUP BY thread_id
     ORDER BY ultima_atividade DESC`,
    [session.user.id]
  );

  return NextResponse.json(threads.rows);
}