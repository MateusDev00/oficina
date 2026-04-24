import { Pool, PoolClient, QueryResult } from 'pg';
declare const pool: Pool;
export declare const query: (texto: string, parametros?: any[]) => Promise<QueryResult>;
export declare const getCliente: () => Promise<PoolClient>;
export declare const testarConexao: () => Promise<boolean>;
export default pool;
//# sourceMappingURL=base_de_dados.d.ts.map