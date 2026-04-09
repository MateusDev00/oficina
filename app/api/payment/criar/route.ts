// app/api/pagamento/criar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { criarPagamento } from '@/lib/pagamento/gateway';

export async function POST(req: NextRequest) {
  const sessao = await getServerSession(authOptions);
  if (!sessao || !sessao.user?.id) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { valor, descricao, ordemServicoId } = await req.json();

    if (!valor || !descricao) {
      return NextResponse.json({ erro: 'Valor e descrição são obrigatórios.' }, { status: 400 });
    }

    const pagamento = await criarPagamento({
      valor,
      descricao,
      usuarioId: parseInt(sessao.user.id),
      ordemServicoId,
    });

    if (!pagamento.sucesso) {
      return NextResponse.json({ erro: pagamento.erro }, { status: 400 });
    }

    return NextResponse.json({
      idTransacao: pagamento.idTransacao,
      mensagem: 'Pagamento iniciado. A confirmação será processada em breve.',
    });
  } catch (erro) {
    console.error('Erro na rota de pagamento:', erro);
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 });
  }
}