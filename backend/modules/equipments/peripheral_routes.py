from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.peripheral import Peripheral

peripheral_bp = Blueprint("peripheral_bp", __name__, url_prefix="/peripheral")


# CREATE
@peripheral_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin")
def create_peripheral():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    peripheral_model = Peripheral()

    try:
        peripheral_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@peripheral_bp.route("", methods=["GET"])
@jwt_required()
def list_peripheral():
    peripheral_model = Peripheral()
    return jsonify(peripheral_model.get_all()), 200


# READ BY ID
@peripheral_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
def get_peripheral(url_id):
    peripheral_model = peripheral()
    peripheral = peripheral_model.get_by_id(url_id)

    if not peripheral:
        return jsonify({"erro": "Impressora não encontrada"}), 404

    return jsonify(peripheral), 200


# UPDATE
@peripheral_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
def update_peripheral(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    peripheral_model = Peripheral()
    peripheral_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@peripheral_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_peripheral(url_id):
    peripheral_model = Peripheral()
    peripheral_model.soft_delete(url_id)

    return jsonify({"status": "impressora desativada"}), 200