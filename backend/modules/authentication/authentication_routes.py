from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta
from utils.security import check_password
from modules.user.user import User

from flasgger import swag_from

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
@swag_from("../../docs/auth/login.yml")
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

    return jsonify({
    "access_token": token,
    "nome": user["nome"],
    "perfil": user["perfil"]
}), 200