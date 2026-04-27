from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.maintenance.maintenance import Maintenance

maintenances_bp = Blueprint("maintenances_bp", __name__, url_prefix="/maintenances")

# CREATE
@maintenances_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin")
def create_maintenance():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    maintenance_model = Maintenance()

    try:
        maintenance_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@maintenances_bp.route("", methods=["GET"])
@jwt_required()
def list_maintenance():
    maintenance_model = Maintenance()
    return jsonify(maintenance_model.get_all()), 200


# READ SELF
@maintenances_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
def get_self(url_id):
    maintenance_model = Maintenance()
    maintenance = maintenance_model.get_by_id(url_id)

    if not maintenance:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify(maintenance), 200


# UPDATE
@maintenances_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
def update_maintenance(url_id):
    dados = request.get_json()
    maintenance_model = Maintenance()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400
    
    maintenance_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@maintenances_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_maintenance(url_id):
    maintenance_model = Maintenance()
    maintenance_model.soft_delete(url_id)

    return jsonify({"status": "usuário desativado"}), 200