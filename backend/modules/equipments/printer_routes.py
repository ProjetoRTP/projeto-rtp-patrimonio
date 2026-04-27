from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.services.printer_service import PrinterService

printer_bp = Blueprint("printer_bp", __name__, url_prefix="/printer")


# CREATE
@printer_bp.route("", methods=["POST"])
@jwt_required()
@check_role("admin")
def create_printer():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = PrinterService()

    try:
        result = service.create(dados)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@printer_bp.route("", methods=["GET"])
@jwt_required()
def list_printers():
    service = PrinterService()
    return jsonify(service.get_all()), 200


# READ BY ID
@printer_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
def get_printer(url_id):
    service = PrinterService()
    printer = service.get_by_id(url_id)

    if not printer:
        return jsonify({"erro": "Impressora não encontrada"}), 404

    return jsonify(printer), 200


# UPDATE
@printer_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
def update_printer(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    service = PrinterService()

    try:
        service.update(url_id, dados)
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# DELETE
@printer_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_printer(url_id):
    service = PrinterService()
    service.delete(url_id)
    return jsonify({"status": "impressora desativada"}), 200