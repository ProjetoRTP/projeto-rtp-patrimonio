from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from functools import wraps
from modules.colaboradores.colaboradores import Colaborador

colaborador_bp = Blueprint("colaborador_bp", __name__, url_prefix="/colaborador")


def check_role_colaborador(cargo):
    def wrapper(f):
        @wraps(f)
        def checker_role_colaborador(*args, **kwargs):
            verify_jwt_in_request()
            jwt = get_jwt()
            if jwt.get("perfil") != cargo: 
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_role_colaborador
    return wrapper


def colaborador_or_admin_colaborador():
    def wrapper(f):
        @wraps(f)
        def checker_colaborador(*args, **kwargs):
            verify_jwt_in_request()
            id_url = kwargs.get("url_id")
            jwt = get_jwt()
            colaborador_id = get_jwt_identity()
            if jwt.get("perfil") != "admin" and str(colaborador_id) != str(id_url):
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_colaborador
    return wrapper


# CREATE
@colaborador_bp.route("/post", methods=["POST"])
def create_colaborador():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    colaborador_model = Colaborador()

    try:
        colaborador_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@colaborador_bp.route("/get", methods=["GET"])
@jwt_required()
def list_colaborador():
    colaborador_model = Colaborador()
    return jsonify(colaborador_model.get_all()), 200


# READ SELF
@colaborador_bp.route("/getself/<int:url_id>", methods=["GET"])
@jwt_required()
@colaborador_or_admin_colaborador()
def get_self(url_id):
    colaborador_model = colaborador()
    colaborador = colaborador_model.get_by_id(url_id)

    if not colaborador:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify(colaborador), 200


# UPDATE
@colaborador_bp.route("/put/<int:url_id>", methods=["PUT"])
@jwt_required()
@colaborador_or_admin_colaborador()
def update_colaborador(url_id):
    dados = request.get_json()
    colaborador_model = Colaborador()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400
    
    colaborador_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@colaborador_bp.route("/delete/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role_colaborador("admin")
def delete_colaborador(url_id):
    colaborador_model = Colaborador()
    colaborador_model.soft_delete(url_id)

    return jsonify({"status": "usuário desativado"}), 200