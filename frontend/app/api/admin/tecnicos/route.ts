import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const result = await query(`SELECT id, nome, email, telefone, especialidade, disponivel FROM utilizadores WHERE papel = 'tecnico' ORDER BY nome`);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { nome, email, telefone, especialidade, disponivel, password } = await req.json();
  const hashed = await bcrypt.hash(password, 10);
  await query(`INSERT INTO utilizadores (nome, email, telefone, hash_senha, papel, especialidade, disponivel) VALUES ($1, $2, $3, $4, 'tecnico', $5, $6)`, [nome, email, telefone, hashed, especialidade || null, disponivel ?? true]);
  return NextResponse.json({ success: true });
}