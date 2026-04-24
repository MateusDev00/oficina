/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/ordens/tecnico/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const result = await query(
      `SELECT id, cliente_id, descricao, estado, data_agendada, prioridade
       FROM ordens_servico
       WHERE tecnico_id = $1
       ORDER BY data_agendada ASC
       LIMIT 10`,
      [userId]
    );
    // Also fetch client names for each order (optional, could do join)
    // But we'll return just the orders and the frontend can show client ID or fetch separately.
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}