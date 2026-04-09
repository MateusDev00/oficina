/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/agent.ts
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  StateGraph,
  START,
  END,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import * as z from "zod";

import { query, getClient } from "./db";
import { vectorStore } from "./rag";
import { embedQuery, formatEmbeddingForPg } from "./embeddings";
import { validarDisponibilidadeTecnico } from "./disponibilidade";
import { reagendarOrdemServico } from "./reagendamento";

// ========================
// MODELOS
// ========================
const llmRapido = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  apiKey: process.env.GROQ_API_KEY,
});

const llmQualidade = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.5,
  apiKey: process.env.GOOGLE_API_KEY,
});

const classificador = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
}).withStructuredOutput(
  z.object({
    modelo: z.enum(["rapido", "qualidade"]),
  })
);

// ========================
// ESTADO
// ========================
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  modelo: Annotation<"rapido" | "qualidade">({
    reducer: (_, y) => y,
    default: () => "rapido",
  }),
});

type StateType = typeof AgentState.State;

// ========================
// HELPERS
// ========================
function texto(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p: any) => p?.text ?? p?.content ?? "").join(" ");
  }
  return String(content ?? "");
}

function ultimaPergunta(messages: BaseMessage[]): string {
  const last = messages[messages.length - 1];
  return texto(last?.content);
}

async function retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let i = 0;
  while (i < retries) {
    try {
      return await fn();
    } catch (e) {
      i++;
      if (i >= retries) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("Falha após retries");
}

// Caches em memória
const historicoCache = new Map<string, string>();
const memoriaCache = new Map<string, string>();

// ========================
// TOOLS
// ========================
function criarTools() {
  const consultarOS = tool(
    async ({ osId }: { osId: number }, config: RunnableConfig) => {
      const clienteId = config.configurable?.clienteId;
      const result = await query(
        `SELECT id, estado, resumo_diagnostico, data_agendada, custo_total
         FROM ordens_servico WHERE id=$1 AND cliente_id=$2`,
        [osId, clienteId]
      );
      if (!result.rows.length)
        return "Ordem de serviço não encontrada ou não pertence a este cliente.";
      const os = result.rows[0];
      return `OS ${os.id} – Estado: ${os.estado}. Diagnóstico: ${
        os.resumo_diagnostico || "não informado"
      }. Agendada para ${os.data_agendada || "sem data"}. Custo total: ${
        os.custo_total || 0
      } Kz.`;
    },
    {
      name: "consultar_ordem_servico",
      description: "Consulta o status de uma ordem de serviço pelo número.",
      schema: z.object({ osId: z.coerce.number().int().positive() }),
    }
  );

  const agendar = tool(
    async (
      { descricao, data }: { descricao: string; data: string },
      config: RunnableConfig
    ) => {
      const clienteId = config.configurable?.clienteId;
      const dataObj = new Date(`${data}T00:00:00`);
      if (isNaN(dataObj.getTime())) return "Data inválida. Use formato YYYY-MM-DD.";
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataObj < hoje) return "A data precisa ser hoje ou futura.";

      const disponibilidade = await validarDisponibilidadeTecnico(data);
      if (!disponibilidade.disponivel)
        return disponibilidade.mensagem || "Não há técnicos disponíveis para esta data.";
      const tecnico = disponibilidade.tecnicos?.[0];
      if (!tecnico) return "Não foi possível identificar um técnico disponível.";

      const veiculoResult = await query(
        `SELECT id FROM veiculos WHERE cliente_id = $1 ORDER BY id ASC LIMIT 1`,
        [clienteId]
      );
      if (veiculoResult.rows.length === 0) {
        return "Não foi possível identificar o veículo. Registe um veículo antes de agendar.";
      }
      const veiculoId = veiculoResult.rows[0].id;

      let client = null;
      try {
        client = await getClient();
        await client.query("BEGIN");

        // Verificar duplicidade de cliente
        const clienteAgendado = await client.query(
          `SELECT id FROM ordens_servico
           WHERE cliente_id = $1 AND data_agendada = $2 FOR UPDATE`,
          [clienteId, data]
        );
        if (clienteAgendado.rows.length > 0) {
          await client.query("ROLLBACK");
          return "Você já possui um agendamento para este dia. Escolha outra data.";
        }

        // Marcar técnico como ocupado (resolver race condition)
        const result = await client.query(
          `INSERT INTO disponibilidade_tecnico (tecnico_id, data, disponivel)
           VALUES ($1, $2, false)
           ON CONFLICT (tecnico_id, data)
           DO UPDATE SET disponivel = false
           WHERE disponibilidade_tecnico.disponivel = true
           RETURNING *`,
          [tecnico.id, data]
        );
        if (result.rows.length === 0) {
          await client.query("ROLLBACK");
          return "Horário ocupado por outro serviço.";
        }

        // Inserir OS
        const insertResult = await client.query(
          `INSERT INTO ordens_servico (
             cliente_id, veiculo_id, tecnico_id, descricao, data_agendada, estado, custo_total
           ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [clienteId, veiculoId, tecnico.id, descricao, data, "pendente", 0]
        );
        const novaOsId = insertResult.rows[0].id;

        await client.query(
          `INSERT INTO notificacoes (utilizador_id, canal, conteudo, estado)
           VALUES ($1, $2, $3, $4)`,
          [tecnico.id, "sistema", `Nova OS #${novaOsId} agendada para ${data}.`, "pendente"]
        );

        await client.query("COMMIT");
        return `Serviço "${descricao}" agendado para ${data} com o técnico ${tecnico.nome}. Número da OS: ${novaOsId}.`;
      } catch (err) {
        if (client) await client.query("ROLLBACK");
        console.error("Erro no agendamento:", err);
        return "Erro ao processar agendamento. Tente novamente.";
      } finally {
        if (client) client.release();
      }
    },
    {
      name: "agendar_servico",
      description: "Agenda um novo serviço. Recebe descrição do problema e data (YYYY-MM-DD).",
      schema: z.object({
        descricao: z.string().min(5),
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    }
  );

  const rag = tool(
    async ({ pergunta }: { pergunta: string }) => {
      try {
        const retriever = vectorStore.asRetriever({ k: 5 });
        const docs = await retriever.invoke(pergunta);
        if (!docs.length) return "Nenhuma informação relevante encontrada.";
        return docs.map((d: any) => d.pageContent).join("\n\n");
      } catch (err) {
        console.error("Erro no RAG:", err);
        return "Não foi possível aceder à base de conhecimento no momento.";
      }
    },
    {
      name: "pesquisar_base_conhecimento",
      description: "Busca informações em manuais técnicos e documentação interna.",
      schema: z.object({ pergunta: z.string() }),
    }
  );

  const reagendar = tool(
    async ({ osId }: { osId: number }, config: RunnableConfig) => {
      const clienteId = config.configurable?.clienteId;
      const check = await query(
        `SELECT id FROM ordens_servico WHERE id = $1 AND cliente_id = $2`,
        [osId, clienteId]
      );
      if (check.rows.length === 0) {
        return "Ordem de serviço não encontrada ou não pertence a este cliente.";
      }
      const novaData = await reagendarOrdemServico(osId);
      if (!novaData) return "Não foi possível reagendar a OS. Contacte a oficina.";
      return `OS ${osId} reagendada para ${novaData.toISOString().slice(0, 10)}.`;
    },
    {
      name: "reagendar_ordem_servico",
      description: "Reagenda uma OS devido à ausência do cliente.",
      schema: z.object({ osId: z.coerce.number().int().positive() }),
    }
  );

  return [consultarOS, agendar, rag, reagendar];
}

// ========================
// GRAPH (singleton)
// ========================
let graphPromise: Promise<any> | null = null;

function getGraph(): Promise<any> {
  if (graphPromise) return graphPromise;

  graphPromise = (async () => {
    let checkpointer;
    if (process.env.POSTGRES_URL) {
      checkpointer = await PostgresSaver.fromConnString(process.env.POSTGRES_URL);
    } else {
      checkpointer = new MemorySaver();
    }

    const tools = criarTools();
    const toolNode = new ToolNode(tools);
    const llmFast = llmRapido.bindTools(tools);
    const llmStrong = llmQualidade.bindTools(tools);

    const selecionar = async (state: StateType) => {
      const pergunta = ultimaPergunta(state.messages);
      const { modelo } = await classificador.invoke([
        new SystemMessage("Classifique a pergunta como 'rapido' (status/agendamento) ou 'qualidade' (diagnóstico/pergunta complexa)."),
        new HumanMessage(pergunta),
      ]);
      return { modelo };
    };

    const validar = async (state: StateType) => {
      const last = state.messages.at(-1);
      if (!last || !(last instanceof AIMessage)) return {};
      const toolCalls = (last as AIMessage).tool_calls;
      if (!toolCalls?.length) return {};

      if (toolCalls.length > 3) {
        const warning = new AIMessage("Muitas ferramentas solicitadas. Tente ser mais específico.");
        return { messages: [warning] };
      }

      for (const tc of toolCalls) {
        const toolDef = tools.find((t) => t.name === tc.name);
        if (toolDef) {
          try {
            (toolDef as any).schema.parse(tc.args);
          } catch (e) {
            const errorMsg = new AIMessage(`Argumento inválido para ${tc.name}: ${(e as Error).message}`);
            return { messages: [errorMsg] };
          }
        }
      }
      return {};
    };

    const routeAposValidacao = (state: StateType) => {
      const last = state.messages.at(-1);
      if (!last || !(last instanceof AIMessage)) return END;
      const toolCalls = (last as AIMessage).tool_calls;
      if (toolCalls?.length) return "toolNode";
      return END;
    };

    const llmCall = async (state: StateType, config: RunnableConfig) => {
      const clienteId = config.configurable?.clienteId as number;
      const modelo = state.modelo === "qualidade" ? llmStrong : llmFast;
      const timeout = state.modelo === "qualidade" ? 15000 : 8000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const pergunta = ultimaPergunta(state.messages);
        const isSimple = ["status", "agendar", "horário"].some(p => pergunta.toLowerCase().includes(p));

        // Histórico (cachead)
        let contextoHistorico = historicoCache.get(`hist-${clienteId}`);
        if (!contextoHistorico) {
          const historico = await query(
            `SELECT conteudo FROM interacoes
             WHERE utilizador_id = $1 AND thread_id = $2
             ORDER BY criado_em DESC LIMIT 5`,
            [clienteId, config.configurable?.thread_id]
          );
          contextoHistorico = historico.rows.map((r) => r.conteudo).join("\n").slice(0, 2000);
          historicoCache.set(`hist-${clienteId}`, contextoHistorico);
        }

        // Memória semântica (cachead)
        let contextoMemoria = "";
        if (!isSimple) {
          const cacheKey = `mem-${clienteId}-${pergunta.slice(0, 100)}`;
          contextoMemoria = memoriaCache.get(cacheKey) || "";
          if (!contextoMemoria) {
            const perguntaEmbedding = await embedQuery(pergunta);
            const perguntaEmbeddingStr = formatEmbeddingForPg(perguntaEmbedding);
            const memoria = await query(
              `SELECT conteudo FROM memoria_usuario
               WHERE utilizador_id = $1
               ORDER BY embedding <=> $2::vector
               LIMIT 3`,
              [clienteId, perguntaEmbeddingStr]
            );
            contextoMemoria = memoria.rows.map((r) => r.conteudo).join("\n").slice(0, 1000);
            memoriaCache.set(cacheKey, contextoMemoria);
          }
        }

const systemPrompt = new SystemMessage(
  `Você é um assistente especializado da Oficina LPN.
   Histórico recente do cliente:\n${contextoHistorico}
   ${!isSimple ? `Memória relevante:\n${contextoMemoria}` : ""}

   **INSTRUÇÕES IMPORTANTES:**
   1. Para agendar um serviço, você DEVE usar a ferramenta "agendar_servico". 
      - Essa ferramenta exige: descrição do problema e data (formato YYYY-MM-DD).
   2. Se o cliente não tiver veículo cadastrado, peça que ele forneça marca, modelo e ano antes de agendar.
   3. Se o cliente não informar a data, pergunte qual dia ele prefere.
   4. Nunca simule um agendamento sem usar a ferramenta.

   Use as ferramentas disponíveis quando necessário:
   - consultar_ordem_servico: para verificar status de uma OS (número da OS).
   - agendar_servico: para criar um novo agendamento (descrição e data).
   - pesquisar_base_conhecimento: para buscar informações em manuais técnicos.
   - reagendar_ordem_servico: para remarcar uma OS faltosa.

   Sempre responda em português claro, profissional e amigável.
   Se não souber a resposta, diga honestamente que não sabe.`
);

        const res = await retry(() =>
          modelo.invoke([systemPrompt, ...state.messages], { signal: controller.signal })
        );
        return { messages: [res] };
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const builder = new StateGraph(AgentState)
      .addNode("select", selecionar)
      .addNode("llm", llmCall)
      .addNode("validate", validar)
      .addNode("toolNode", toolNode)
      .addEdge(START, "select")
      .addEdge("select", "llm")
      .addEdge("llm", "validate")
      .addConditionalEdges("validate", routeAposValidacao, ["toolNode", END])
      .addEdge("toolNode", "llm");

    return builder.compile({ checkpointer: checkpointer as any });
  })();

  return graphPromise;
}

// ========================
// EXPORTAÇÃO
// ========================
export async function processarMensagem(
  pergunta: string,
  userId: string,
  threadId?: string
): Promise<string> {
  const clienteId = parseInt(userId);
  if (isNaN(clienteId)) throw new Error("ID de utilizador inválido");

  const finalThreadId = threadId || `user-${clienteId}-${Date.now()}`;

  // Inserções no banco podem lançar exceções; capturamos tudo no try/catch
  try {
    await query(
      `INSERT INTO interacoes (utilizador_id, direcao, conteudo, thread_id)
       VALUES ($1, 'entrada', $2, $3)`,
      [clienteId, pergunta, finalThreadId]
    );
    const embedding = await embedQuery(pergunta);
    await query(
      `INSERT INTO memoria_usuario (utilizador_id, conteudo, embedding)
       VALUES ($1, $2, $3)`,
      [clienteId, pergunta, formatEmbeddingForPg(embedding)]
    );
  } catch (dbError) {
    console.error("Erro ao salvar pergunta no banco:", dbError);
    // Apesar do erro, continuamos tentando responder (mas pode perder o histórico)
  }

  try {
    const graph = await getGraph();
    const result = await graph.invoke(
      { messages: [new HumanMessage(pergunta)] },
      {
        configurable: {
          thread_id: finalThreadId,
          clienteId,
        },
      }
    );

    const messages = result.messages as BaseMessage[];
    const resposta = texto(messages.at(-1)?.content);

    // Salvar resposta (tentar, mesmo que falhe)
    try {
      await query(
        `INSERT INTO interacoes (utilizador_id, direcao, conteudo, thread_id)
         VALUES ($1, 'saida', $2, $3)`,
        [clienteId, resposta, finalThreadId]
      );
      const respostaEmbedding = await embedQuery(resposta);
      await query(
        `INSERT INTO memoria_usuario (utilizador_id, conteudo, embedding)
         VALUES ($1, $2, $3)`,
        [clienteId, resposta, formatEmbeddingForPg(respostaEmbedding)]
      );
    } catch (saveError) {
      console.error("Erro ao salvar resposta:", saveError);
    }

    return resposta;
  } catch (error) {
    console.error("Erro no processamento do grafo:", error);
    const erroMsg = "Ocorreu um erro ao tentar processar a tua mensagem. Tenta novamente mais tarde.";
    // Tenta salvar a mensagem de erro no banco (opcional)
    try {
      await query(
        `INSERT INTO interacoes (utilizador_id, direcao, conteudo, thread_id)
         VALUES ($1, 'saida', $2, $3)`,
        [clienteId, erroMsg, finalThreadId]
      );
    } catch (e) {}
    return erroMsg;
  }
}