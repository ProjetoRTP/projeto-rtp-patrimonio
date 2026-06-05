from fastapi import APIRouter, HTTPException, status

from app.auth.schemas import (
    LoginRequest,
    LoginResponse
)

from app.models.user_model import UserModel

from app.auth.security import verify_password
from app.auth.service import create_access_token

router = APIRouter(
    prefix = "/auth",
    tags = ["Autenticação"]
)

@router.post(
    "/login",
    response_model = LoginResponse
)
def Login(dados: LoginRequest):

    user = UserModel.get_by_cpf(dados.cpf)

    if not user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Credenciais inválidas"
        )
    
    if not user["ativo"]:
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail = "Usuário inativo"
        )
    
    if not verify_password(
        dados.senha,
        user["senha"]
    ):
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Credenciais inválidas"
        )
    
    token = create_access_token({
        "sub": str(user['id']),
        "perfil": user["perfil"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "nome": user["nome"],
        "perfil": user["perfil"]
    }