from flask import Blueprint, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.history.history import History

history_bp = Blueprint("history_bp", __name__, url_prefix="/history")

VALID_EVENT_TYPES = {
    'cadastro',
    'movimentacao',
    'manutencao_entrada',
    'manutencao_saida',
    'mudanca_status'
}


# READ ALL — full event timeline
@history_bp.route("", methods=["GET"])
@jwt_required()
@swag_from("../../docs/history/list_history.yml")
def list_history():
    history_model = History()
    return jsonify(history_model.get_all()), 200


# READ BY ID
@history_bp.route("/<int:event_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/history/get_history_event.yml")
def get_history_event(event_id):
    history_model = History()
    event = history_model.get_by_id(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    return jsonify(event), 200


# READ BY EQUIPMENT — timeline for a specific equipment
@history_bp.route("/equipment/<int:equipment_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/history/get_history_by_equipment.yml")
def get_history_by_equipment(equipment_id):
    history_model = History()
    return jsonify(history_model.get_by_equipment(equipment_id)), 200


# READ BY TYPE — filter by event type
@history_bp.route("/type/<string:event_type>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/history/get_history_by_type.yml")
def get_history_by_type(event_type):
    if event_type not in VALID_EVENT_TYPES:
        return jsonify({
            "error": f"Invalid type. Use: {', '.join(VALID_EVENT_TYPES)}"
        }), 400

    history_model = History()
    return jsonify(history_model.get_by_type(event_type)), 200
