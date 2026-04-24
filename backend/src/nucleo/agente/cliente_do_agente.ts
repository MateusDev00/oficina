import axios, { AxiosInstance } from 'axios';
import { AGENTE_SERVICE_URL, AGENTE_SECRET_KEY, NODE_ENV } from '../../configuracao/ambiente';
import { DecisaoAgente, EventoPayload } from '../../tipos/eventos';

interface ProcessarMensagemResponse {
  resposta: string;
  acoes_executadas?: any[];
}

interface ProcessarEventoResponse {
  resolvido: boolean;
  acoes: Array<{
    tipo: string;
    parametros: Record<string, any>;
  }>;
  justificativa?: string;
}

class ClienteDoAgente {
  private cliente: AxiosInstance;

  constructor() {
    this.cliente = axios.create({
      baseURL: AGENTE_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AGENTE_SECRET_KEY}`,
      },
    });

    if (NODE_ENV === 'desenvolvimento') {
      this.cliente.interceptors.request.use((config) => {
        console.log(`[Agente] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });
    }
  }

  async processarMensagem(mensagem: string, contexto: Record<string, any> = {}): Promise<ProcessarMensagemResponse> {
    try {
      const { data } = await this.cliente.post<ProcessarMensagemResponse>('/conversa', {
        mensagem,
        contexto_usuario: contexto,
      });
      return data;
    } catch (erro: any) {
      console.error('Erro ao processar mensagem com agente:', erro.message);
      throw new Error('Falha na comunicação com o agente inteligente');
    }
  }

  async processarEvento(evento: { id: number; tipo: string; payload: EventoPayload }): Promise<ProcessarEventoResponse> {
    try {
      const { data } = await this.cliente.post<ProcessarEventoResponse>('/evento', {
        tipo: evento.tipo,
        payload: evento.payload,
        id_evento: evento.id,
      });
      return data;
    } catch (erro: any) {
      console.error('Erro ao enviar evento para o agente:', erro.message);
      throw new Error('Falha na comunicação com o agente para processamento de evento');
    }
  }

  async verificarSaude(): Promise<boolean> {
    try {
      const { data } = await this.cliente.get('/saude');
      return data.status === 'ativo';
    } catch {
      return false;
    }
  }
}

export default new ClienteDoAgente();