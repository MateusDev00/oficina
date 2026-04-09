// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, telefone, password } = await req.json();

    if (!nome || !email || !telefone || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    // Verificar duplicados
    const existing = await query(
      'SELECT id FROM utilizadores WHERE email = $1 OR telefone = $2',
      [email, telefone]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'E-mail ou telefone já registado' }, { status: 409 });
    }

    // Hash da senha com bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO utilizadores (nome, email, telefone, hash_senha, papel)
       VALUES ($1, $2, $3, $4, 'cliente')`,
      [nome, email, telefone, hashedPassword]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no registo:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}