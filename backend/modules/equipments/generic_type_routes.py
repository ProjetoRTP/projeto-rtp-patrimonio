from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.services.generic_type_service import GenericTypeService

generics_bp = Blueprint("generics_bp", __name__, url_prefix="/generics")


# =============================================================
# ROTAS DE TIPOS GENÉRICOS — apenas admin
# /generics/types
# =============================================================

# CREATE TYPE
@generics_bp.route("/types", methods=["POST"])
@jwt_required()
@check_role("admin")
@swag_from("../../docs/generics/create_generic_type.yml")
def create_generic_type():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = GenericTypeService()

    try:
        result = service.create(dados)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL TYPES
@generics_bp.route("/types", methods=["GET"])
@jwt_required()
@swag_from("../../docs/generics/list_generic_types.yml")
def list_generic_types():
    service = GenericTypeService()
    return jsonify(service.get_all()), 200


# READ TYPE BY ID
@generics_bp.route("/types/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/generics/get_generic_type.yml")
def get_generic_type(url_id):
    service = GenericTypeService()
    tipo = service.get_by_id(url_id)

    if not tipo:
        return jsonify({"erro": "Tipo genérico não encontrado"}), 404

    return jsonify(tipo), 200


# UPDATE TYPE — apenas admin
@generics_bp.route("/types/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
@swag_from("../../docs/generics/update_generic_type.yml")
def update_generic_type(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = GenericTypeService()

    try:
        service.update(url_id, dados)
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# DELETE TYPE — apenas admin
@generics_bp.route("/types/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
@swag_from("../../docs/generics/delete_generic_type.yml")
def delete_generic_type(url_id):
    service = GenericTypeService()

    try:
        service.soft_delete(url_id)
        return jsonify({"status": "Tipo genérico removido"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400