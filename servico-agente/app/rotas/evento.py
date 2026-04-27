from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.agente import AgenteOficina

router = APIRouter()

class EventoRequest(BaseModel):
    tipo: str
    payload: dict
    id_evento: Optional[int] = None

@router.post("")
async def processar_evento(request: EventoRequest):
    try:
        agente = AgenteOficina()
        resultado = await agente.processar_evento(request.tipo, request.payload)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))