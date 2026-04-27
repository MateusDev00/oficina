import os
from langchain_groq import ChatGroq
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv

from app.ferramentas import (
    consultar_status_ordem,
    verificar_disponibilidade,
    criar_agendamento,
    listar_veiculos_cliente,
    sugerir_tecnico
)
from app.decisao.regras_duras import aplicar_regras_duras
from app.decisao.regras_suaves import decidir_com_ia

load_dotenv()

class AgenteOficina:
    def __init__(self):
        self.modelo = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.ferramentas = [
            consultar_status_ordem,
            verificar_disponibilidade,
            criar_agendamento,
            listar_veiculos_cliente,
            sugerir_tecnico
        ]
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """És o assistente virtual da Oficina LPN. Ajudas clientes com informações de ordens, agendamentos e disponibilidade. 
            NUNCA inventes dados. Usa sempre as ferramentas disponíveis."""),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        agente = create_tool_calling_agent(self.modelo, self.ferramentas, self.prompt)
        self.executor = AgentExecutor(agent=agente, tools=self.ferramentas, verbose=True)

    async def processar_mensagem(self, mensagem: str, historico: list = None):
        resultado = await self.executor.ainvoke({
            "input": mensagem,
            "chat_history": historico or []
        })
        return {"resposta": resultado["output"]}

    async def processar_evento(self, tipo: str, payload: dict):
        # Primeiro tenta regras duras
        decisao = aplicar_regras_duras(tipo, payload)
        if decisao["resolvido"]:
            return decisao

        # Senão, usa IA
        decisao_ia = await decidir_com_ia(self.modelo, tipo, payload, self.ferramentas)
        return decisao_ia