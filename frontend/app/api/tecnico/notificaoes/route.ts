/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tecnico') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const apenasNaoLidas = searchParams.get('naoLidas') === 'true';

  let sql = `SELECT id, conteudo, lida, criado_em FROM notificacoes WHERE utilizador_id = $1`;
  
  const params: any[] = [session.user.id];
  if (apenasNaoLidas) {
    sql += ` AND lida = false`;
  }
  sql += ` ORDER BY criado_em DESC`;

  const result = await query(sql, params);
  return NextResponse.json({
    notificacoes: result.rows,
    total: apenasNaoLidas ? result.rows.length : result.rows.filter((n: any) => !n.lida).length,
  });
}