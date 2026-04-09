import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const result = await query(`
    SELECT os.id, os.descricao, os.estado, os.data_agendada, os.custo_total,
           c.nome as cliente_nome, t.nome as tecnico_nome
    FROM ordens_servico os
    LEFT JOIN utilizadores c ON os.cliente_id = c.id
    LEFT JOIN utilizadores t ON os.tecnico_id = t.id
    ORDER BY os.criado_em DESC
  `);
  return NextResponse.json(result.rows);
}