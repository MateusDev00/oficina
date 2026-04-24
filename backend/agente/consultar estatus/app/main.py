from fastapi import FastAPI, Request
from pydantic import BaseModel
from agent import executor
from models import criar_tabelas
from scheduler import iniciar_scheduler

app = FastAPI()  # Corrigido: parênteses

# Modelo para receber JSON do Next.js
class MensagemRequest(BaseModel):
    mensagem: str

@app.on_event("startup")
def startup_event():
    criar_tabelas()
    iniciar_scheduler()

@app.post("/agente")  # POST é mais seguro e permite corpo JSON
async def run_agent(request: MensagemRequest):
    resposta = executor.invoke({"input": request.mensagem})
    return {"resposta": resposta["output"]}

@app.get("/health")
def health_check():
    return {"status": "ativo"}