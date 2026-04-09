/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auditoria.ts
import { query } from './db';

export async function registrarAuditoria(
  usuarioId: number,
  acao: string,
  entidade: string,
  entidadeId: number,
  dadosAntigos: any = null,
  dadosNovos: any = null
) {
  await query(
    `INSERT INTO auditoria (usuario_id, acao, entidade, entidade_id, dados_antigos, dados_novos)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [usuarioId, acao, entidade, entidadeId, dadosAntigos ? JSON.stringify(dadosAntigos) : null, dadosNovos ? JSON.stringify(dadosNovos) : null]
  );
}