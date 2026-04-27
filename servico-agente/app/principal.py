from fastapi import FastAPI
from dotenv import load_dotenv
from app.rotas import conversa, evento
import os

load_dotenv()

app = FastAPI(title="Agente Oficina LPN")

@app.on_event("startup")
async def startup():
    # Aqui podem ser feitas verificações iniciais, se necessário
    pass

app.include_router(conversa.router, prefix="/conversa", tags=["Conversa"])
app.include_router(evento.router, prefix="/evento", tags=["Evento"])

@app.get("/saude")
def saude():
    return {"status": "ativo"}