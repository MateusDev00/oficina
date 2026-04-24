from pydantic import  BaseModel

class AgendamentoSchema(BaseModel):
    nome: str
    data: str
    hora: str


