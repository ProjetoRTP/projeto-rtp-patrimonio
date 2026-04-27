from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.services.peripheral_service import PeripheralService

peripheral_bp = Blueprint("peripheral_bp", __name__, url_prefix="/peripheral")


# CREATE
@peripheral_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin")
def create_peripheral():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = PeripheralService()

    try:
        result = service.create(dados)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@peripheral_bp.route("", methods=["GET"])
@jwt_required()
def list_peripherals():
    service = PeripheralService()
    return jsonify(service.get_all()), 200


# READ BY ID
@peripheral_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
def get_peripheral(url_id):
    service = PeripheralService()
    peripheral = service.get_by_id(url_id)

    if not peripheral:
        return jsonify({"erro": "Periférico não encontrado"}), 404

    return jsonify(peripheral), 200


# READ BY COMPUTER
@peripheral_bp.route("/computer/<int:computador_id>", methods=["GET"])
@jwt_required()
def get_peripherals_by_computer(computador_id):
    service = PeripheralService()
    return jsonify(service.get_by_computer(computador_id)), 200


# LINK ao computador
@peripheral_bp.route("/link", methods=["POST"])
@jwt_required()
@check_role("admin")
def link_peripheral():
    dados = request.get_json()

    if not dados.get("computador_id") or not dados.get("periferico_id"):
        return jsonify({"erro": "computador_id e periferico_id são obrigatórios"}), 400

    service = PeripheralService()

    try:
        service.link(dados["computador_id"], dados["periferico_id"])
        return jsonify({"status": "periférico vinculado"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# UNLINK do computador
@peripheral_bp.route("/unlink", methods=["POST"])
@jwt_required()
@check_role("admin")
def unlink_peripheral():
    dados = request.get_json()

    if not dados.get("computador_id") or not dados.get("periferico_id"):
        return jsonify({"erro": "computador_id e periferico_id são obrigatórios"}), 400

    service = PeripheralService()

    try:
        service.unlink(dados["computador_id"], dados["periferico_id"])
        return jsonify({"status": "periférico desvinculado"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# UPDATE
@peripheral_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
def update_peripheral(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = PeripheralService()

    try:
        service.update(url_id, dados)
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# DELETE
@peripheral_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_peripheral(url_id):
    service = PeripheralService()
    service.delete(url_id)
    return jsonify({"status": "periférico desativado"}), 200