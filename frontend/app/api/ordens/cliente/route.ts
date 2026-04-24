/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/ordens/cliente/route.ts
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
      `SELECT id, descricao, estado, data_agendada, custo_total
       FROM ordens_servico
       WHERE cliente_id = $1
       ORDER BY data_agendada DESC
       LIMIT 10`,
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}