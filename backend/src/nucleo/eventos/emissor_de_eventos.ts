import { query } from '../../configuracao/base_de_dados';
import redis from '../../configuracao/redis';
import { TipoEvento, EventoPayload, Evento } from '../../tipos/eventos';

const EVENTOS_VALIDOS: TipoEvento[] = [
  'ORDEM_CRIADA',
  'ORDEM_ATRASADA',
  'PAGAMENTO_CONFIRMADO',
  'TECNICO_INDISPONIVEL',
  'ORDEM_CONCLUIDA',
  'AGENDAMENTO_ALTERADO',
  'CLIENTE_NOTIFICADO',
  'REAGENDAMENTO_AUTOMATICO'
];

interface MetadadosEvento {
  origem?: string;
  [key: string]: any;
}

export async function emitirEvento(
  tipo: TipoEvento,
  payload: EventoPayload,
  metadados: MetadadosEvento = {}
): Promise<Evento> {
  if (!EVENTOS_VALIDOS.includes(tipo)) {
    throw new Error(`Tipo de evento invalido: ${tipo}`);
  }

  const payloadJSON = JSON.stringify(payload);
  
  const resultado = await query(
    `INSERT INTO eventos (tipo, payload, processado)
     VALUES ($1, $2, FALSE)
     RETURNING id, criado_em`,
    [tipo, payloadJSON]
  );

  const evento: Evento = {
    id: resultado.rows[0].id,
    tipo,
    payload,
    processado: false,
    tentativas: 0,
    ultimo_erro: null,
    criado_em: resultado.rows[0].criado_em,
    processado_em: null
  };

  await redis.publish('eventos:sistema', JSON.stringify({
    id: evento.id,
    tipo,
    payload,
    metadados,
    criado_em: evento.criado_em
  }));

  await redis.lpush('fila:eventos:pendentes', evento.id.toString());

  console.log(`[Evento] ${tipo} emitido (ID: ${evento.id})`);
  return evento;
}

export async function marcarComoProcessado(eventoId: number, erro?: Error): Promise<void> {
  if (erro) {
    await query(
      `UPDATE eventos 
       SET tentativas = tentativas + 1, 
           ultimo_erro = $2 
       WHERE id = $1`,
      [eventoId, erro.message]
    );
  } else {
    await query(
      `UPDATE eventos 
       SET processado = TRUE, 
           processado_em = NOW() 
       WHERE id = $1`,
      [eventoId]
    );
  }
}