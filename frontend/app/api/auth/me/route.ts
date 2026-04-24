// app/api/auth/me/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  return NextResponse.json(session.user);
}