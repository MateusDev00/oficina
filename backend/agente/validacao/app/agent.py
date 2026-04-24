from langchain.tools import  tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import  AgentExecutor,create_tool_calling_agent
from langchain_groq import  ChatGroq
from tools import  agendar
from dotenv import  load_dotenv
import  os

load_dotenv()

@tool
def agendar_tool(nome:str,data:str,hora:str) -> str:
    """AGENDAR UM ATENDIMENTO"""
    return  agendar(nome,data,hora)

modelo=ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY"))

template=ChatPromptTemplate.from_messages([
    ("system","você é um assistente prestativo para agendamento "),
    ("human",f"{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools=[agendar_tool]
agent=create_tool_calling_agent (modelo,tools,template)
agent_executor=AgentExecutor(agent=agent,tools=tools,verbose=True)


if __name__ =="__main__":
    entrada=input("fazer agenda")
    agent_executor.invoke=({"input":entrada})