from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import timedelta
from database.connection import get_connection

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()
    cpf = dados.get("cpf")
    senha = dados.get("senha")

    if not cpf or not senha:
        return jsonify({"erro": "Cpf e senha obrigatórios"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE cpf=%s AND senha=%s AND ativo=TRUE", (cpf, senha))
        usuario = cursor.fetchone()

        if usuario:
            access_token = create_access_token(
                identity=usuario["id"],
                additional_claims={"cargo": usuario["perfil"]},
                expires_delta=timedelta(hours=1)
            )
            return jsonify({
                "status": "sucesso",
                "token": access_token,
                "usuario": {
                    "id": usuario["id"],
                    "nome": usuario["nome"],
                    "perfil": usuario["perfil"]
                }
            }), 200
        else:
            return jsonify({"erro": "Usuário ou senha inválidos"}), 401

    except mysql.connector.Error as err:
        return jsonify({"erro": f"Erro no banco: {err}"}), 500

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        usuario_id = get_jwt_identity()
        return jsonify({
            "status": "sucesso",
            "mensagem": f"Logout realizado para usuário {usuario_id}"
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400