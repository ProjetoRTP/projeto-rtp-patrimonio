from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from utils.decorators import check_role
from modules.equipments.services.printer_service import PrinterService

printer_bp = Blueprint("printer_bp", __name__, url_prefix="/printer")


# CREATE — qualquer usuário autenticado pode cadastrar
@printer_bp.route("", methods=["POST"])
@jwt_required()
@swag_from("../../docs/equipments/create_printer.yml")
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
@swag_from("../../docs/equipments/list_printers.yml")
def list_printers():
    service = PrinterService()
    return jsonify(service.get_all()), 200


# READ BY ID
@printer_bp.route("/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/equipments/get_printer.yml")
def get_printer(url_id):
    service = PrinterService()
    printer = service.get_by_id(url_id)

    if not printer:
        return jsonify({"erro": "Impressora não encontrada"}), 404

    return jsonify(printer), 200


# READ BY STATUS
@printer_bp.route("/lista", methods=["GET"])
@jwt_required()
def listar():
    status = request.args.get("status")
    setor = request.args.get("setor")

    service = PrinterService()
    impressora = service.listar(status=status, setor=setor)

    return jsonify(impressora), 200


# UPDATE — gerente ou admin
@printer_bp.route("/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/equipments/update_printer.yml")
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


# DELETE — gerente ou admin
@printer_bp.route("/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/equipments/delete_printer.yml")
def delete_printer(url_id):
    service = PrinterService()
    service.delete(url_id)
    return jsonify({"status": "impressora desativada"}), 200