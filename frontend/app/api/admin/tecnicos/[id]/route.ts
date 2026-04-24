/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/tecnicos/[id]/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params; // 👈 aguardar a Promise
  const { nome, email, telefone, especialidade, disponivel, password } = await req.json();

  // ... resto do código (construir fields, values)
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  fields.push(`nome = $${idx++}`); values.push(nome);
  fields.push(`email = $${idx++}`); values.push(email);
  fields.push(`telefone = $${idx++}`); values.push(telefone);
  fields.push(`especialidade = $${idx++}`); values.push(especialidade || null);
  fields.push(`disponivel = $${idx++}`); values.push(disponivel ?? true);
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    fields.push(`hash_senha = $${idx++}`); values.push(hashed);
  }
  values.push(id);

  await query(`UPDATE utilizadores SET ${fields.join(', ')} WHERE id = $${idx}`, values);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  await query('DELETE FROM utilizadores WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}