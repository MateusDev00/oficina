import { EventoPayload } from '../../tipos/eventos';
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
declare class ClienteDoAgente {
    private cliente;
    constructor();
    processarMensagem(mensagem: string, contexto?: Record<string, any>): Promise<ProcessarMensagemResponse>;
    processarEvento(evento: {
        id: number;
        tipo: string;
        payload: EventoPayload;
    }): Promise<ProcessarEventoResponse>;
    verificarSaude(): Promise<boolean>;
}
declare const _default: ClienteDoAgente;
export default _default;
//# sourceMappingURL=cliente_do_agente.d.ts.map