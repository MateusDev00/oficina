/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/documentos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { vectorStore } from '@/lib/rag';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const titulo = searchParams.get('titulo');

  let sql = `SELECT id, titulo, metadata, LEFT(conteudo, 200) as preview FROM documento_chunks`;
  const params: any[] = [];
  if (titulo) {
    sql += ` WHERE titulo = $1`;
    params.push(titulo);
  }
  sql += ` ORDER BY id`;

  const result = await query(sql, params);
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const titulo = formData.get('titulo') as string;

    if (!file || !titulo) {
      return NextResponse.json({ error: 'Ficheiro e título são obrigatórios' }, { status: 400 });
    }

    // Converter File para Blob (PDFLoader aceita Blob)
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    });
    const chunks = await splitter.splitDocuments(docs);

    const enriched = chunks.map(chunk => ({
      ...chunk,
      metadata: { ...chunk.metadata, titulo, fonte: file.name },
    }));

    await vectorStore.addDocuments(enriched);

    return NextResponse.json({ success: true, chunks: enriched.length });
  } catch (error) {
    console.error('Erro ao indexar documento:', error);
    return NextResponse.json({ error: 'Erro ao processar documento' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'administrador') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const titulo = searchParams.get('titulo');
  if (!titulo) {
    return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });
  }

  await query(`DELETE FROM documento_chunks WHERE metadata->>'titulo' = $1`, [titulo]);

  return NextResponse.json({ success: true });
}