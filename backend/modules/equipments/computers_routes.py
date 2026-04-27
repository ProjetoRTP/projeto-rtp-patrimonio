from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.classes.computers import Computer
from modules.equipments.services.computer_service import ComputerService

computers_bp = Blueprint("computers_bp", __name__, url_prefix="/computers")


# CREATE
@computers_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin")
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
def list_computers():
    computers_model = Computer()
    return jsonify(computers_model.get_all()), 200


# READ BY ID
@computers_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
def get_computer(url_id):
    computers_model = Computer()
    computer = computers_model.get_by_id(url_id)

    if not computer:
        return jsonify({"erro": "Computador não encontrado"}), 404

    return jsonify(computer), 200


# UPDATE
@computers_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
def update_computer(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    computers_model = Computer()
    computers_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@computers_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_computer(url_id):
    computers_model = Computer()
    computers_model.soft_delete(url_id)

    return jsonify({"status": "computador desativado"}), 200