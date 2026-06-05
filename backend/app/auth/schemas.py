from pydantic import BaseModel

class LoginRequest(BaseModel):
    cpf: str
    senha: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    nome: str
    perfil: str