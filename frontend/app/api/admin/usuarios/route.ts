import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const result = await query(
    `SELECT id, nome, email, telefone, papel, especialidade, disponivel FROM utilizadores ORDER BY nome`
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { nome, email, telefone, papel, especialidade, password } = await req.json();
  if (!nome || !email || !telefone || !password) {
    return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO utilizadores (nome, email, telefone, hash_senha, papel, especialidade) VALUES ($1, $2, $3, $4, $5, $6)`,
    [nome, email, telefone, hashed, papel, especialidade || null]
  );
  return NextResponse.json({ success: true });
}