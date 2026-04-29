from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.sectors.subsectors import Subsector

subsectors_bp = Blueprint("subsectors_bp", __name__, url_prefix="/subsectors")


# CREATE
@subsectors_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/sectors/create_subsector.yml")
def create_subsector():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    if not dados.get("nome"):
        return jsonify({"erro": "nome é obrigatório"}), 400

    if not dados.get("setor_id"):
        return jsonify({"erro": "setor_id é obrigatório"}), 400

    subsector_model = Subsector()

    try:
        new_id = subsector_model.create(dados)
        return jsonify({"status": "sucesso", "id": new_id}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@subsectors_bp.route("", methods=["GET"])
@jwt_required()
@swag_from("../../docs/sectors/list_subsectors.yml")
def list_subsectors():
    subsector_model = Subsector()
    return jsonify(subsector_model.get_all()), 200


# READ BY ID
@subsectors_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/sectors/get_subsector.yml")
def get_subsector(url_id):
    subsector_model = Subsector()
    subsector = subsector_model.get_by_id(url_id)

    if not subsector:
        return jsonify({"erro": "Subsetor não encontrado"}), 404

    return jsonify(subsector), 200


# READ BY SECTOR
@subsectors_bp.route("/sector/<int:setor_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/sectors/get_subsectors_by_sector.yml")
def get_subsectors_by_sector(setor_id):
    subsector_model = Subsector()
    return jsonify(subsector_model.get_by_sector(setor_id)), 200


# UPDATE
@subsectors_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/sectors/update_subsector.yml")
def update_subsector(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    subsector_model = Subsector()

    try:
        subsector_model.update(url_id, dados)
        return jsonify({"status": "sucesso"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# DELETE
@subsectors_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/sectors/delete_subsector.yml")
def delete_subsector(url_id):
    subsector_model = Subsector()
    subsector_model.soft_delete(url_id)

    return jsonify({"status": "subsetor desativado"}), 200
