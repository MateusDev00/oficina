from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.agente import AgenteOficina

router = APIRouter()

class MensagemRequest(BaseModel):
    mensagem: str

@router.post("")
async def conversar(request: MensagemRequest):
    try:
        agente = AgenteOficina()
        resultado = await agente.processar_mensagem(request.mensagem)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))