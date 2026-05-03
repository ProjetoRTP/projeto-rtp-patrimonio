from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from modules.reports.report import Report

reports_bp = Blueprint("reports_bp", __name__, url_prefix="/reports")


# LIST ALL
@reports_bp.route("", methods=["GET"])
@jwt_required()
def list_reports():
    report_model = Report()
    reports = report_model.get_all()
    return jsonify([report_model.serialize(r) for r in reports]), 200


# CREATE
@reports_bp.route("", methods=["POST"])
@jwt_required()
def create_report():
    data = request.get_json()

    if not data:
        return jsonify({"erro": "JSON inválido"}), 400

    if not data.get("tipo"):
        return jsonify({"erro": "tipo é obrigatório"}), 400

    user_id = get_jwt_identity()
    data["usuario_id"] = int(user_id)

    report_model = Report()

    try:
        report_id = report_model.create(data)
        return jsonify({"id": report_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# GET BY ID
@reports_bp.route("/<int:report_id>", methods=["GET"])
@jwt_required()
def get_report(report_id):
    report_model = Report()
    report = report_model.get_by_id(report_id)

    if not report:
        return jsonify({"erro": "Relatório não encontrado"}), 404

    return jsonify(report_model.serialize(report)), 200


# DELETE
@reports_bp.route("/<int:report_id>", methods=["DELETE"])
@jwt_required()
def delete_report(report_id):
    report_model = Report()
    try:
        report_model.soft_delete(report_id)
        return jsonify({"status": "relatório removido"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400