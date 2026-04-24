// app/api/ordens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id: ordemId } = await params;
  const { estado } = await req.json();

  // Verificar permissão (apenas técnico ou administrador)
  if (session.user.role !== 'tecnico' && session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    await query(
      `UPDATE ordens_servico SET estado = $1, atualizado_em = NOW() WHERE id = $2`,
      [estado, ordemId]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}