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

  // Total de OS atribuídas e seus status
  const osStats = await query(`
    SELECT estado, COUNT(*) as total
    FROM ordens_servico
    WHERE tecnico_id = $1
    GROUP BY estado
  `, [tecnicoId]);

  const total_os = osStats.rows.reduce((acc, row) => acc + parseInt(row.total), 0);
  const pendentes = osStats.rows.find(r => r.estado === 'pendente')?.total || 0;
  const em_andamento = osStats.rows.find(r => r.estado === 'em_andamento')?.total || 0;
  const concluidas = osStats.rows.find(r => r.estado === 'concluida')?.total || 0;
  const aguardando_pecas = osStats.rows.find(r => r.estado === 'aguardando_pecas')?.total || 0;

  // Ordens recentes (últimas 5)
  const recentes = await query(`
    SELECT os.id, os.descricao, os.estado, os.data_agendada, u.nome as cliente_nome
    FROM ordens_servico os
    JOIN utilizadores u ON os.cliente_id = u.id
    WHERE os.tecnico_id = $1
    ORDER BY os.criado_em DESC
    LIMIT 5
  `, [tecnicoId]);

  return NextResponse.json({
    total_os,
    pendentes,
    em_andamento,
    concluidas,
    aguardando_pecas,
    recentes: recentes.rows,
  });
}