// app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // 1. Autenticação
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // 2. Leitura do corpo (opcional, apenas para evitar erros)
  let body;
  try {
    body = await req.json();
  } catch (error) {
    // Corpo inválido não impede a resposta, apenas loga
    console.error('Erro ao parsear JSON:', error);
  }

  // 3. Retorna a mensagem indicando que o agente não está conectado
  return NextResponse.json({
    message: 'O agente existe mas não está conectado à aplicação.',
    status: 'disconnected'
  });
}