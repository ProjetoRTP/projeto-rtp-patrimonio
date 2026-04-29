from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.maintenance.maintenance import Maintenance

maintenances_bp = Blueprint("maintenances_bp", __name__, url_prefix="/maintenances")

# CREATE — qualquer usuário autenticado pode abrir uma OS
@maintenances_bp.route("", methods=["POST"])
@jwt_required()
@swag_from("../../docs/maintenance/create_maintenance.yml")
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
@swag_from("../../docs/maintenance/list_maintenance.yml")
def list_maintenance():
    maintenance_model = Maintenance()
    return jsonify(maintenance_model.get_all()), 200


# READ BY ID
@maintenances_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/maintenance/get_maintenance.yml")
def get_maintenance(url_id):
    maintenance_model = Maintenance()
    maintenance = maintenance_model.get_by_id(url_id)

    if not maintenance:
        return jsonify({"erro": "Manutenção não encontrada"}), 404

    return jsonify(maintenance), 200


# UPDATE — gerente ou admin
@maintenances_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/maintenance/update_maintenance.yml")
def update_maintenance(url_id):
    dados = request.get_json()
    maintenance_model = Maintenance()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    maintenance_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE — gerente ou admin
# Cancelar uma OS é o equivalente a "deletar": muda status para 'cancelada'.
# O trigger trg_manutencao_encerrada reverte automaticamente o equipamento para 'ativo'.
@maintenances_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/maintenance/delete_maintenance.yml")
def delete_maintenance(url_id):
    maintenance_model = Maintenance()

    maintenance = maintenance_model.get_by_id(url_id)
    if not maintenance:
        return jsonify({"erro": "Manutenção não encontrada"}), 404

    maintenance_model.change_status(url_id, "cancelada")

    return jsonify({"status": "manutenção cancelada"}), 200