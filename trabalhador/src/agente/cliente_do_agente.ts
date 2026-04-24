import axios from 'axios';

const AGENTE_SERVICE_URL = process.env.AGENTE_SERVICE_URL || 'http://localhost:8000';
const AGENTE_SECRET_KEY = process.env.AGENTE_SECRET_KEY || 'chave-secreta-padrao';

export interface DecisaoEventoResponse {
  resolvido: boolean;
  acoes: { tipo: string; parametros: Record<string, any> }[];
  justificativa?: string;
}

export async function processarEventoNoAgente(
  evento: { id: number; tipo: string; payload: any }
): Promise<DecisaoEventoResponse> {
  try {
    const response = await axios.post(
      `${AGENTE_SERVICE_URL}/evento`,
      {
        tipo: evento.tipo,
        payload: evento.payload,
        id_evento: evento.id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AGENTE_SECRET_KEY}`,
        },
        timeout: 20000,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Erro ao chamar agente para evento:', error.message);
    throw new Error('Falha na comunicação com o agente');
  }
}