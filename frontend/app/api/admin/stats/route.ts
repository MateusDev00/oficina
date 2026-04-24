// app/api/admin/stats/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Total de clientes
    const clientes = await query("SELECT COUNT(*) FROM utilizadores WHERE papel = 'cliente'");
    const totalClientes = parseInt(clientes.rows[0].count);

    // Total de técnicos
    const tecnicos = await query("SELECT COUNT(*) FROM utilizadores WHERE papel = 'tecnico'");
    const totalTecnicos = parseInt(tecnicos.rows[0].count);

    // Ordens de serviço por estado
    const ordens = await query(`
      SELECT estado, COUNT(*) as total FROM ordens_servico GROUP BY estado
    `);
    const ordensMap: Record<string, number> = {};
    ordens.rows.forEach(row => { ordensMap[row.estado] = parseInt(row.total); });
    const totalOrdens = Object.values(ordensMap).reduce((a, b) => a + b, 0);

    // Faturamento mensal (últimos 12 meses)
    const faturamento = await query(`
      SELECT DATE_TRUNC('month', criado_em) as mes, SUM(valor) as total
      FROM pagamentos
      WHERE estado = 'pago' AND criado_em >= NOW() - INTERVAL '12 months'
      GROUP BY mes
      ORDER BY mes
    `);
    const faturamentoMensal = faturamento.rows.map(row => ({
      mes: new Date(row.mes).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      total: parseFloat(row.total),
    }));

    // Distribuição de estados (para gráfico de pizza)
    const statusDist = Object.entries(ordensMap).map(([name, value]) => ({ name, value }));

    // Carga dos técnicos (top 5)
    const cargaTecnicos = await query(`
      SELECT u.nome, COUNT(os.id) as total_os
      FROM utilizadores u
      LEFT JOIN ordens_servico os ON u.id = os.tecnico_id
      WHERE u.papel = 'tecnico'
      GROUP BY u.id, u.nome
      ORDER BY total_os DESC
      LIMIT 5
    `);
    const tecnicosCarga = cargaTecnicos.rows.map(row => ({
      nome: row.nome,
      total: parseInt(row.total_os),
    }));

    return NextResponse.json({
      totalClientes,
      totalTecnicos,
      totalOrdens,
      ordensPendentes: ordensMap.pendente || 0,
      ordensConcluidas: ordensMap.concluida || 0,
      ordensAndamento: ordensMap.em_andamento || 0,
      faturamentoMensal,
      statusDist,
      tecnicosCarga,
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}