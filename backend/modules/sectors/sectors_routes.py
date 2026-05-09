from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.sectors.sectors import Sector
from flasgger import swag_from

sectors_bp = Blueprint("sectors_bp", __name__, url_prefix="/sectors")

# CREATE
@sectors_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/sectors/create.yml")
def create_sector():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    sector_model = Sector()

    try:
        new_id = sector_model.create(dados)
        return jsonify({"status": "sucesso", "id": new_id}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@sectors_bp.route("", methods=["GET"])
@jwt_required()
@swag_from("../../docs/sectors/get_all.yml")
def list_sector():
    sector_model = Sector()
    check = request.args.get("inativo")
    if check == "True":
        inactive = True
    else:
        inactive = False
    return jsonify(sector_model.get_all(inactive)), 200


# READ SELF
@sectors_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/sectors/get.yml")
def get_self(url_id):
    sector_model = Sector()
    sector = sector_model.get_by_id(url_id)

    if not sector:
        return jsonify({"erro": "Setor não encontrado"}), 404

    return jsonify(sector), 200


# UPDATE
@sectors_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/sectors/update.yml")
def update_sector(url_id):
    dados = request.get_json()
    sector_model = Sector()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400
    
    sector_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@sectors_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/sectors/delete.yml")
def delete_sector(url_id):
    sector_model = Sector()
    sector_model.soft_delete(url_id)

    return jsonify({"status": "setor desativado"}), 200