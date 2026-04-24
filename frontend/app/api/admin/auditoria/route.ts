import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const result = await query(
    `SELECT a.*, u.nome as usuario_nome
     FROM auditoria a
     LEFT JOIN utilizadores u ON a.usuario_id = u.id
     ORDER BY a.criado_em DESC
     LIMIT 500`
  );

  return NextResponse.json({ logs: result.rows });
}