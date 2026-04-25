from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from modules.user.user import User

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()

    cpf = dados.get("cpf")
    senha = dados.get("senha")

    user_model = User()
    usuarios = user_model.get_all(include_inactive=True)

    user = next((u for u in usuarios if u["cpf"] == cpf and u["senha"] == senha), None)

    if not user:
        return jsonify({"erro": "Credenciais inválidas"}), 401

    token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"perfil": user["perfil"]}
    )

    return jsonify({"access_token": token}), 200