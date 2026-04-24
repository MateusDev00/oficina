from langchain_groq import ChatGroq
from langchain.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor  # Corrigido: create
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os
from tools import obter_status, gerar_mensagem, notificar_tool

load_dotenv()

model = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

template = ChatPromptTemplate.from_messages([
    ("system", """
    Você é um agente de atendimento de uma oficina técnica.
    Consulte SEMPRE a base de dados antes de responder.
    NUNCA invente informações.
    Use as ferramentas disponíveis para buscar status ou notificar clientes.
    """),
    ("human", "{input}"),  # Corrigido: chaves balanceadas
    ("placeholder", "{agent_scratchpad}")
])

agent = create_tool_calling_agent(  # Corrigido o nome da função
    model,
    tools=[notificar_tool],  # status_tool é redundante, notificar_tool já gera mensagem
    prompt=template
)

executor = AgentExecutor(
    agent=agent,
    tools=[notificar_tool],
    verbose=True  # verbose_progress não existe, é verbose
)