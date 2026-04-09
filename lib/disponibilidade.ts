/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/disponibilidade.ts
import { query } from './db';

export interface TecnicoDisponivel {
  id: number;
  nome: string;
  especialidade: string;
}

export async function validarDisponibilidadeTecnico(
  data: string,
  especialidade?: string,
  tecnicoId?: number
): Promise<{ disponivel: boolean; tecnicos?: TecnicoDisponivel[]; mensagem?: string }> {
  const hoje = new Date().toISOString().slice(0, 10);
  if (data < hoje) {
    return { disponivel: false, mensagem: 'Não é possível agendar para uma data passada.' };
  }

  let sql = `
    SELECT u.id, u.nome, u.especialidade
    FROM utilizadores u
    LEFT JOIN disponibilidade_tecnico dt
      ON u.id = dt.tecnico_id AND dt.data = $1
    WHERE u.papel = 'tecnico'
      AND u.disponivel = true
      AND (dt.disponivel IS NULL OR dt.disponivel = true)
  `;
  const params: any[] = [data];
  let paramIndex = 2;

  if (especialidade) {
    sql += ` AND u.especialidade ILIKE $${paramIndex}`;
    params.push(`%${especialidade}%`);
    paramIndex++;
  }

  if (tecnicoId) {
    sql += ` AND u.id = $${paramIndex}`;
    params.push(tecnicoId);
  }

  const result = await query(sql, params);
  if (result.rows.length === 0) {
    return { disponivel: false, mensagem: 'Nenhum técnico disponível para esta data.' };
  }

  return {
    disponivel: true,
    tecnicos: result.rows,
  };
}