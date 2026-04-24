"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const ambiente_1 = require("../../configuracao/ambiente");
class ClienteDoAgente {
    cliente;
    constructor() {
        this.cliente = axios_1.default.create({
            baseURL: ambiente_1.AGENTE_SERVICE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ambiente_1.AGENTE_SECRET_KEY}`,
            },
        });
        if (ambiente_1.NODE_ENV === 'desenvolvimento') {
            this.cliente.interceptors.request.use((config) => {
                console.log(`[Agente] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            });
        }
    }
    async processarMensagem(mensagem, contexto = {}) {
        try {
            const { data } = await this.cliente.post('/conversa', {
                mensagem,
                contexto_usuario: contexto,
            });
            return data;
        }
        catch (erro) {
            console.error('Erro ao processar mensagem com agente:', erro.message);
            throw new Error('Falha na comunicação com o agente inteligente');
        }
    }
    async processarEvento(evento) {
        try {
            const { data } = await this.cliente.post('/evento', {
                tipo: evento.tipo,
                payload: evento.payload,
                id_evento: evento.id,
            });
            return data;
        }
        catch (erro) {
            console.error('Erro ao enviar evento para o agente:', erro.message);
            throw new Error('Falha na comunicação com o agente para processamento de evento');
        }
    }
    async verificarSaude() {
        try {
            const { data } = await this.cliente.get('/saude');
            return data.status === 'ativo';
        }
        catch {
            return false;
        }
    }
}
exports.default = new ClienteDoAgente();
//# sourceMappingURL=cliente_do_agente.js.map