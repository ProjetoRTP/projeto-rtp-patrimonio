from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from functools import wraps
from database.connection import get_connection

user_bp = Blueprint("user_bp", __name__, url_prefix="/user")


def check_role_user(cargo):
    def wrapper(f):
        @wraps(f)
        def checker_role_user(*args, **kwargs):
            verify_jwt_in_request()
            jwt = get_jwt()
            if jwt.get("cargo") != cargo:
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_role_user
    return wrapper

def user_or_admin_user():
    def wrapper(f):
        @wraps(f)
        def checker_user(*args, **kwargs):
            verify_jwt_in_request()
            id_url = kwargs.get("url_id")
            jwt = get_jwt()
            user_id = get_jwt_identity()
            if jwt.get("cargo") != "admin" and str(user_id) != str(id_url):
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_user
    return wrapper


# CREATE
@user_bp.route("/post", methods=["POST"])
def cria_user():
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha, perfil)
            VALUES (%s, %s, %s, %s)
        """, (dados["nome"], dados["email"], dados["senha"], dados.get("perfil", "operador")))
        conn.commit()
        return jsonify({"status": "sucesso"}), 201
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# READ ALL
@user_bp.route("/get", methods=["GET"])
@jwt_required()
def list_user():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nome, email, perfil, ativo, data_criacao FROM usuarios")
        response = cursor.fetchall()
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# READ SELF
@user_bp.route("/getself/<int:url_id>", methods=["GET"])
@jwt_required()
def get_self(url_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nome, email, perfil, ativo, data_criacao FROM usuarios WHERE id=%s", (url_id,))
        response = cursor.fetchone()
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# UPDATE
@user_bp.route("/put/<int:url_id>", methods=["PUT"])
@user_or_admin_user()
@jwt_required()
def update_user(url_id):
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "JSON inválido ou ausente"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE usuarios SET nome=%s, email=%s, senha=%s, perfil=%s WHERE id=%s
        """, (dados["nome"], dados["email"], dados["senha"], dados.get("perfil", "operador"), url_id))
        conn.commit()
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# DELETE
@user_bp.route("/delete/<int:url_id>", methods=["DELETE"])
@check_role_user("admin")
def delete_user(url_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id=%s", (url_id,))
        conn.commit()
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 400
    finally:
        cursor.close()
        conn.close()
