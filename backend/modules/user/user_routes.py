from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from functools import wraps
from modules.user.user import User

user_bp = Blueprint("user_bp", __name__, url_prefix="/user")


def check_role_user(cargo):
    def wrapper(f):
        @wraps(f)
        def checker_role_user(*args, **kwargs):
            verify_jwt_in_request()
            jwt = get_jwt()
            if jwt.get("perfil") != cargo: 
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
            if jwt.get("perfil") != "admin" and str(user_id) != str(id_url):
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_user
    return wrapper


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
@user_bp.route("/getself/<int:url_id>", methods=["GET"])
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
@check_role_user("admin")
def delete_user(url_id):
    user_model = User()
    user_model.soft_delete(url_id)


    return jsonify({"status": "usuário desativado"}), 200