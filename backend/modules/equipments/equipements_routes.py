from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from functools import wraps
from modules.equipments.equipments import Equipments

equipments_bp = Blueprint("equipments_bp", __name__, url_prefix="/equipments")


def check_role_equipments(cargo):
    def wrapper(f):
        @wraps(f)
        def checker_role_equipments(*args, **kwargs):
            verify_jwt_in_request()
            jwt = get_jwt()
            if jwt.get("perfil") != cargo: 
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_role_equipments
    return wrapper


def equipments_or_admin_equipments():
    def wrapper(f):
        @wraps(f)
        def checker_equipments(*args, **kwargs):
            verify_jwt_in_request()
            id_url = kwargs.get("url_id")
            jwt = get_jwt()
            equipments_id = get_jwt_identity()
            if jwt.get("perfil") != "admin" and str(equipments_id) != str(id_url):
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_equipments
    return wrapper


# CREATE
@equipments_bp.route("/post", methods=["POST"])
def create_equipments():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    equipments_model = Equipments()

    try:
        equipments_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@equipments_bp.route("/get", methods=["GET"])
@jwt_required()
def list_equipments():
    equipments_model = Equipments()
    return jsonify(equipments_model.get_all()), 200


# READ SELF
@equipments_bp.route("/getself/<int:url_id>", methods=["GET"])
@jwt_required()
@equipments_or_admin_equipments()
def get_self(url_id):
    equipments_model = Equipments()
    equipments = equipments_model.get_by_id(url_id)

    if not equipments:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify(equipments), 200


# UPDATE
@equipments_bp.route("/put/<int:url_id>", methods=["PUT"])
@jwt_required()
@equipments_or_admin_equipments()
def update_equipments(url_id):
    dados = request.get_json()
    equipments_model = Equipments()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400
    
    equipments_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@equipments_bp.route("/delete/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role_equipments("admin")
def delete_equipments(url_id):
    equipments_model = Equipments()
    equipments_model.soft_delete(url_id)

    return jsonify({"status": "usuário desativado"}), 200