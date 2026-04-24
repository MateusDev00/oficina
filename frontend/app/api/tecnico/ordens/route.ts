import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tecnico') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const tecnicoId = parseInt(session.user.id);
  const result = await query(`
    SELECT os.id, os.descricao, os.estado, os.data_agendada, os.custo_total, os.resumo_diagnostico,
           u.nome as cliente_nome
    FROM ordens_servico os
    JOIN utilizadores u ON os.cliente_id = u.id
    WHERE os.tecnico_id = $1
    ORDER BY os.criado_em DESC
  `, [tecnicoId]);

  return NextResponse.json(result.rows);
}