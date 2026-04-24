"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processarEventoNoAgente = processarEventoNoAgente;
const axios_1 = __importDefault(require("axios"));
const AGENTE_SERVICE_URL = process.env.AGENTE_SERVICE_URL || 'http://localhost:8000';
const AGENTE_SECRET_KEY = process.env.AGENTE_SECRET_KEY || 'chave-secreta-padrao';
async function processarEventoNoAgente(evento) {
    try {
        const response = await axios_1.default.post(`${AGENTE_SERVICE_URL}/evento`, {
            tipo: evento.tipo,
            payload: evento.payload,
            id_evento: evento.id,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${AGENTE_SECRET_KEY}`,
            },
            timeout: 20000,
        });
        return response.data;
    }
    catch (error) {
        console.error('Erro ao chamar agente para evento:', error.message);
        throw new Error('Falha na comunicação com o agente');
    }
}
