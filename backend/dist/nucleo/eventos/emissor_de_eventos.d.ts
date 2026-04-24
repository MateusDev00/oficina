import { TipoEvento, EventoPayload, Evento } from '../../tipos/eventos';
interface MetadadosEvento {
    origem?: string;
    [key: string]: any;
}
export declare function emitirEvento(tipo: TipoEvento, payload: EventoPayload, metadados?: MetadadosEvento): Promise<Evento>;
export declare function marcarComoProcessado(eventoId: number, erro?: Error): Promise<void>;
export {};
//# sourceMappingURL=emissor_de_eventos.d.ts.map