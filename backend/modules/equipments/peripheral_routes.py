from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.services.peripheral_service import PeripheralService

peripheral_bp = Blueprint("peripheral_bp", __name__, url_prefix="/peripherals")


# CREATE — qualquer usuário autenticado pode cadastrar
@peripheral_bp.route("", methods=["POST"])
@jwt_required()
@swag_from("../../docs/equipments/create_peripheral.yml")
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
@swag_from("../../docs/equipments/list_peripherals.yml")
def list_peripherals():
    service = PeripheralService()
    return jsonify(service.get_all()), 200


# READ BY ID
@peripheral_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/equipments/get_peripheral.yml")
def get_peripheral(url_id):
    service = PeripheralService()
    peripheral = service.get_by_id(url_id)

    if not peripheral:
        return jsonify({"erro": "Periférico não encontrado"}), 404

    return jsonify(peripheral), 200


# READ BY STATUS
@peripheral_bp.route("/lista", methods=["GET"])
@jwt_required()
def listar():
    status = request.args.get("status")
    setor = request.args.get("setor")

    service = PeripheralService()
    periferico = service.listar(status=status, setor=setor)

    return jsonify(periferico), 200


# READ BY COMPUTER
@peripheral_bp.route("/computer/<int:computador_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/equipments/get_peripherals_by_computer.yml")
def get_peripherals_by_computer(computador_id):
    service = PeripheralService()
    return jsonify(service.get_by_computer(computador_id)), 200


# LINK ao computador — qualquer autenticado (faz parte da transferência)
@peripheral_bp.route("/link", methods=["POST"])
@jwt_required()
@swag_from("../../docs/equipments/link_peripheral.yml")
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


# UNLINK do computador — qualquer autenticado
@peripheral_bp.route("/unlink", methods=["POST"])
@jwt_required()
@swag_from("../../docs/equipments/unlink_peripheral.yml")
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


# UPDATE — gerente ou admin
@peripheral_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/equipments/update_peripheral.yml")
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


# DELETE — gerente ou admin
@peripheral_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/equipments/delete_peripheral.yml")
def delete_peripheral(url_id):
    service = PeripheralService()
    service.delete(url_id)
    return jsonify({"status": "periférico desativado"}), 200