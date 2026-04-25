from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role, user_or_admin_user
from modules.user.user import User
from datetime import datetime, timedelta
from modules.user.forgot_password import send_email, create_token

user_bp = Blueprint("user_bp", __name__, url_prefix="/user")
tokenSaved = {}


# CREATE
@user_bp.route("/post", methods=["POST"])
def create_user():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    user_model = User()

    try:
        user_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@user_bp.route("/get", methods=["GET"])
@jwt_required()
def list_user():
    user_model = User()
    return jsonify(user_model.get_all()), 200


# READ SELF
@user_bp.route("/get/<int:url_id>", methods=["GET"])
@jwt_required()
@user_or_admin_user()
def get_self(url_id):
    user_model = User()
    user = user_model.get_by_id(url_id)

    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify(user), 200


# UPDATE
@user_bp.route("/put/<int:url_id>", methods=["PUT"])
@jwt_required()
@user_or_admin_user()
def update_user(url_id):
    dados = request.get_json()
    user_model = User()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400
    
    user_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@user_bp.route("/delete/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_user(url_id):
    user_model = User()
    user_model.soft_delete(url_id)

    return jsonify({"status": "usuário desativado"}), 200



# FORGOT PASSWORD
@user_bp.route('/forgot-password', methods=['POST'])
def send_token():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    email = dados.get("email")

    if not email:
        return jsonify({"erro": "Email obrigatório"}), 400

    user_model = User()

    try:
        user = user_model.get_by_email(email)

        if not user:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        registro = tokenSaved.get(email)

        if registro:
            if datetime.now() < registro["expira"]:
                return jsonify({
                    "erro": "Já existe um token válido. Aguarde expirar."
                }), 400
            
        token = create_token()

        tokenSaved[email] = {
            "token": token,
            "expira": datetime.now() + timedelta(minutes=5)
        }

        send_email(email, token)

        return jsonify({
            "status": "sucesso",
            "mensagem": "Token enviado para o email"
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
@user_bp.route('/reset-password', methods=['PUT'])
def reset_password():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    email = dados.get("email")
    token = dados.get("token")
    new_password = dados.get("senha")

    if not email or not token or not new_password:
        return jsonify({"erro": "Dados incompletos"}), 400

    registro = tokenSaved.get(email)

    if not registro:
        return jsonify({"erro": "Token não encontrado"}), 400

    if registro["token"] != token:
        return jsonify({"erro": "Token inválido"}), 400

    if datetime.now() > registro["expira"]:
        return jsonify({"erro": "Token expirado"}), 400

    user_model = User()

    try:
        user_model.update_password_by_email(email, new_password)

        del tokenSaved[email]

        return jsonify({
            "status": "sucesso",
            "mensagem": "Senha atualizada com sucesso"
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500