// app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processarMensagem } from '@/lib/agent';

export async function POST(req: NextRequest) {
  // 1. Autenticação
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // 2. Leitura do corpo com tratamento de erro
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('Erro ao parsear JSON:', error);
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const { mensagem, threadId } = body;
  if (!mensagem || typeof mensagem !== 'string') {
    return NextResponse.json({ error: 'Mensagem inválida ou não fornecida' }, { status: 400 });
  }

  // 3. Processamento da mensagem com try/catch para garantir que qualquer erro retorne JSON
  try {
    const resposta = await processarMensagem(mensagem, session.user.id.toString(), threadId);
    return NextResponse.json({ resposta });
  } catch (error) {
    console.error('Erro no processamento da mensagem:', error);
    // Retorna uma mensagem amigável para o usuário
    return NextResponse.json(
      { error: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}