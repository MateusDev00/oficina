import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

// GET: buscar horários atuais
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT dia_semana, abertura, fechamento, ativo
       FROM horario_funcionamento`
    );
    const horarios: Record<string, { abertura: string; fechamento: string }> = {};
    for (const row of result.rows) {
      if (row.ativo) {
        horarios[row.dia_semana] = {
          abertura: row.abertura,
          fechamento: row.fechamento,
        };
      }
    }
    return NextResponse.json(horarios);
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT: atualizar horários
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const horarios = await req.json(); // objeto { dia: { abertura, fechamento } }

    // Iniciar transação
    await query('BEGIN');

    // Desativar todos os horários atuais (opcional, mas simples)
    await query('UPDATE horario_funcionamento SET ativo = false');

    // Inserir os novos horários (os que vieram no objeto)
    const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    for (const dia of dias) {
      const horario = horarios[dia];
      if (horario) {
        await query(
          `INSERT INTO horario_funcionamento (dia_semana, abertura, fechamento, ativo)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (id) DO UPDATE
           SET abertura = EXCLUDED.abertura, fechamento = EXCLUDED.fechamento, ativo = true`,
          [dia, horario.abertura, horario.fechamento]
        );
      }
    }

    await query('COMMIT');

    // Log de auditoria
    await query(
      `INSERT INTO logs_auditoria (utilizador_id, acao, entidade, detalhes)
       VALUES ($1, $2, $3, $4)`,
      [parseInt(session.user.id), 'ATUALIZAR_HORARIOS', 'horario_funcionamento', JSON.stringify(horarios)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Erro ao salvar horários:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}