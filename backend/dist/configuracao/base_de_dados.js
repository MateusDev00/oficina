"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testarConexao = exports.getCliente = exports.query = void 0;
const pg_1 = require("pg");
const ambiente_1 = require("./ambiente");
const pool = new pg_1.Pool({
    connectionString: ambiente_1.DATABASE_URL,
    ssl: ambiente_1.NODE_ENV === 'producao' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('connect', (client) => {
    client.on('error', (err) => {
        console.error('Erro inesperado no cliente PostgreSQL', err);
    });
});
const query = async (texto, parametros) => {
    return pool.query(texto, parametros);
};
exports.query = query;
const getCliente = async () => {
    return await pool.connect();
};
exports.getCliente = getCliente;
// NOVA FUNÇÃO ADICIONADA
const testarConexao = async () => {
    try {
        const resultado = await (0, exports.query)('SELECT NOW() as agora');
        console.log('PostgreSQL: Conexão estabelecida em', resultado.rows[0].agora);
        return true;
    }
    catch (erro) {
        console.error('PostgreSQL: Falha na conexão:', erro.message);
        return false;
    }
};
exports.testarConexao = testarConexao;
exports.default = pool;
//# sourceMappingURL=base_de_dados.js.map