from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.classes.computers import Computer
from modules.equipments.services.computer_service import ComputerService

computers_bp = Blueprint("computers_bp", __name__, url_prefix="/computers")


# CREATE — qualquer usuário autenticado pode cadastrar
@computers_bp.route("", methods=["POST"])
@jwt_required()
@swag_from("../../docs/equipments/create_computer.yml")
def create_computer():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = ComputerService()

    try:
        result = service.create(dados)
        return jsonify(result), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@computers_bp.route("", methods=["GET"])
@jwt_required()
@swag_from("../../docs/equipments/list_computers.yml")
def list_computers():
    service = ComputerService()
    return jsonify(service.get_all()), 200


# READ BY ID
@computers_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/equipments/get_computer.yml")
def get_computer(url_id):
    service = ComputerService()
    computer = service.get_by_id(url_id)

    if not computer:
        return jsonify({"erro": "Computador não encontrado"}), 404

    return jsonify(computer), 200


# UPDATE — gerente ou admin
@computers_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/equipments/update_computer.yml")
def update_computer(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = ComputerService()
    service.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE — gerente ou admin
@computers_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/equipments/delete_computer.yml")
def delete_computer(url_id):
    service = ComputerService()
    service.delete(url_id)

    return jsonify({"status": "computador desativado"}), 200