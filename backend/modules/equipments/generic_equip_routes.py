from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from utils.decorators import check_role
from modules.equipments.services.generic_equip_service import GenericService
from modules.equipments.generic_type_routes import generics_bp


# =============================================================
# ROTAS DE EQUIPAMENTOS GENÉRICOS — admin e gerente
# /generics
# =============================================================

# CREATE
@generics_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/generics/create_generic.yml")
def create_generic():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = GenericService()

    try:
        result = service.create(dados)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@generics_bp.route("", methods=["GET"])
@jwt_required()
@swag_from("../../docs/generics/list_generics.yml")
def list_generics():
    service = GenericService()
    return jsonify(service.get_all()), 200


# READ BY ID
@generics_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/generics/get_generic.yml")
def get_generic(url_id):
    service = GenericService()
    generic = service.get_by_id(url_id)

    if not generic:
        return jsonify({"erro": "Equipamento genérico não encontrado"}), 404

    return jsonify(generic), 200


# READ BY STATUS
@generics_bp.route("/lista", methods=["GET"])
@jwt_required()
def listar():
    status = request.args.get("status")
    setor = request.args.get("setor")

    service = GenericService()
    generico = service.listar(status=status, setor=setor)

    return jsonify(generico), 200


# UPDATE — admin ou gerente
@generics_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/generics/update_generic.yml")
def update_generic(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = GenericService()

    try:
        service.update(url_id, dados)
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# DELETE — admin ou gerente
@generics_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/generics/delete_generic.yml")
def delete_generic(url_id):
    service = GenericService()

    try:
        service.delete(url_id)
        return jsonify({"status": "Equipamento genérico desativado"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400