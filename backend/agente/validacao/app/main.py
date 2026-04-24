import  os
from fastapi import  FastAPI,HTTPExceptin
from pydantic import  BaseModel
from typing import  optional

from transformers.utils.chat_template_utils import description_re

from agent import  agent_executor

app=FastAPI (title="AGENTE DE AGENDAMENTO",
             description="AGENTE DE IA DE AGENDAMENTO",
             verssion="1.0.0")
class ChatInput(BaseModel):
    pergunta: str

class Chatresponse(BaseModel):
    status: str
    resposta: str

@app.get("/")
def read_root():
    return {"message":" AGENTE DE AGENDAMENTO"}
@app.post("/agendar",response_model=Chatresponse)
async def processar_agendamento(input_data:ChatInput):
    """edpoint para receber uma mens do usuario e encaminhar para o agente"""
    try:
        resultado=agent_executor.invoke({"input":input_data.pergunta})
        return Chatresponse(
            status="sucesso",
            resposta=resultado["output"]
        )
    except Exception as e:
        HTTPExceptin(status_code=500,detail=f"Erro interno dirija-se na empresa para um agendamento presencial:{str(e)}")


