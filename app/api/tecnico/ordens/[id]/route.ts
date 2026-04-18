import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'tecnico') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const tecnicoId = parseInt(session.user.id);
  const ordemId = parseInt(id);
  const { estado, resumo_diagnostico } = await req.json();

  // Verificar se a OS pertence ao técnico
  const check = await query(
    'SELECT id FROM ordens_servico WHERE id = $1 AND tecnico_id = $2',
    [ordemId, tecnicoId]
  );
  if (check.rows.length === 0) {
    return NextResponse.json(
      { error: 'Ordem não encontrada ou não pertence a você' },
      { status: 403 }
    );
  }

  await query(
    `
    UPDATE ordens_servico
    SET estado = COALESCE($1, estado),
        resumo_diagnostico = COALESCE($2, resumo_diagnostico),
        atualizado_em = NOW()
    WHERE id = $3
    `,
    [estado, resumo_diagnostico, ordemId]
  );

  // Se concluída, registrar data de conclusão
  if (estado === 'concluida') {
    await query(
      'UPDATE ordens_servico SET concluido_em = NOW() WHERE id = $1',
      [ordemId]
    );
  }

  return NextResponse.json({ success: true });
}