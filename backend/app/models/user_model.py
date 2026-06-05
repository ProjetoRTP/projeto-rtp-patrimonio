from app.auth.security import hash_password

fake_users = [
    {
        "id": 1,
        "cpf": "12345678910",
        "nome": "Administrador",
        "perfil": "admin",
        "ativo": True,
        "senha": hash_password("123456")
    }
]

class UserModel:

    @staticmethod
    def get_by_cpf(cpf: str):

        for user in fake_users:
            if user["cpf"] == cpf:
                return user
        
        return None