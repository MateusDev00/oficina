import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { validarDisponibilidadeTecnico } from '@/lib/disponibilidade';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { tecnicoId, data, hora, duracao, valor } = await req.json();

  // Validação de campos
  if (!tecnicoId || !data || !hora || !duracao || !valor) {
    return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 });
  }

  // 1. Verificar se o técnico está disponível nesse dia/horário
  const disponibilidade = await validarDisponibilidadeTecnico(data, undefined, tecnicoId);
  if (!disponibilidade.disponivel) {
    return NextResponse.json({ disponivel: false, mensagem: disponibilidade.mensagem });
  }

  // 2. Simular pagamento (sempre aprovado)
  const pagamentoSimulado = {
    sucesso: true,
    transacaoId: `SIM_${Date.now()}`,
  };
  if (!pagamentoSimulado.sucesso) {
    return NextResponse.json({ disponivel: false, mensagem: 'Falha no pagamento' });
  }

  // 3. Registrar o agendamento
  const clienteId = parseInt(session.user.id);
  const result = await query(
    `INSERT INTO ordens_servico (cliente_id, tecnico_id, data_agendada, descricao, estado)
     VALUES ($1, $2, $3, $4, 'pendente')
     RETURNING id`,
    [clienteId, tecnicoId, data, `Agendamento para ${hora}`]
  );
  const ordemId = result.rows[0].id;

  // 4. Marcar o técnico como ocupado na data
  await query(
    `INSERT INTO disponibilidade_tecnico (tecnico_id, data, disponivel)
     VALUES ($1, $2, false)
     ON CONFLICT (tecnico_id, data) DO UPDATE SET disponivel = false`,
    [tecnicoId, data]
  );

  // 5. Registrar pagamento simulado
  await query(
    `INSERT INTO pagamentos (ordem_servico_id, valor, metodo, referencia_gateway, estado)
     VALUES ($1, $2, 'dinheiro_movel', $3, 'concluido')`,
    [ordemId, valor, pagamentoSimulado.transacaoId]
  );

  return NextResponse.json({
    disponivel: true,
    ordemId,
    pagamento: pagamentoSimulado,
  });
}