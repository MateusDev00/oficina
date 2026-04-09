// lib/embeddings.ts
import { pipeline } from '@xenova/transformers';
import { query } from './db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

// Converte array de números para o formato exigido pelo pgvector: [0.1,0.2,...]
export function formatEmbeddingForPg(embedding: number[]): string {
  return '[' + embedding.join(',') + ']';
}

// Converte string do banco de volta para array de números
export function parseEmbeddingFromPg(embeddingStr: string): number[] {
  const trimmed = embeddingStr.slice(1, -1);
  if (!trimmed) return [];
  return trimmed.split(',').map(Number);
}

export async function embedQuery(texto: string): Promise<number[]> {
  const cache = await query('SELECT embedding FROM cache_embeddings WHERE texto = $1', [texto]);
  if (cache.rows.length) {
    return parseEmbeddingFromPg(cache.rows[0].embedding);
  }

  const model = await getEmbedder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await model(texto, { pooling: 'mean', normalize: true as any });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const embedding = Array.from((output as any).data) as number[];

  const formatted = formatEmbeddingForPg(embedding);
  await query(
    'INSERT INTO cache_embeddings (texto, embedding) VALUES ($1, $2) ON CONFLICT (texto) DO NOTHING',
    [texto, formatted]
  );

  return embedding;
}

// Objeto embeddings compatível com LangChain (não usa herança)
export const embeddings = {
  embedQuery: async (text: string): Promise<number[]> => embedQuery(text),
  embedDocuments: async (texts: string[]): Promise<number[][]> => Promise.all(texts.map(t => embedQuery(t))),
};