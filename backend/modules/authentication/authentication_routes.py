from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta
from modules.utils.security import check_password
from modules.user.user import User

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    cpf = dados.get("cpf")
    senha = dados.get("senha")

    if not cpf or not senha:
        return jsonify({"erro": "CPF e senha obrigatórios"}), 400

    user_model = User()
    user = user_model.get_by_cpf(cpf)

    if not user:
        return jsonify({"erro": "Credenciais inválidas"}), 401

    if not user["ativo"]:
        return jsonify({"erro": "Usuário inativo"}), 403

    if not check_password(senha, user["senha"]):
        return jsonify({"erro": "Credenciais inválidas"}), 401

    token = create_access_token(
        identity=str(user["id"]),
        additional_claims={"perfil": user["perfil"]},
        expires_delta=timedelta(hours=2)
    )

    return jsonify({"access_token": token}), 200