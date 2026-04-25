from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.equipments.printer import Printer

printer_bp = Blueprint("printer_bp", __name__, url_prefix="/printer")


# CREATE
@printer_bp.route("/post", methods=["POST"])
@jwt_required()
@check_role("admin")
def create_printer():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    printer_model = Printer()

    try:
        printer_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@printer_bp.route("/get", methods=["GET"])
@jwt_required()
def list_printer():
    printer_model = Printer()
    return jsonify(printer_model.get_all()), 200


# READ BY ID
@printer_bp.route("/get/<int:url_id>", methods=["GET"])
@jwt_required()
def get_printer(url_id):
    printer_model = Printer()
    printer = printer_model.get_by_id(url_id)

    if not printer:
        return jsonify({"erro": "Impressora não encontrada"}), 404

    return jsonify(printer), 200


# UPDATE
@printer_bp.route("/put/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin")
def update_printer(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    printer_model = Printer()
    printer_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@printer_bp.route("/delete/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin")
def delete_printer(url_id):
    printer_model = Printer()
    printer_model.soft_delete(url_id)

    return jsonify({"status": "impressora desativada"}), 200