from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required, get_jwt_identity
from modules.movements.movement import Movement

movements_bp = Blueprint("movements_bp", __name__, url_prefix="/movements")


# CREATE — any authenticated user can register a transfer
@movements_bp.route("", methods=["POST"])
@jwt_required()
@swag_from("../../docs/movements/create_movement.yml")
def create_movement():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    if not data.get("equipamento_id"):
        return jsonify({"error": "equipamento_id is required"}), 400

    if not data.get("setor_destino_id"):
        return jsonify({"error": "setor_destino_id is required"}), 400

    user_id = get_jwt_identity()
    movement_model = Movement()

    try:
        movement_id = movement_model.create_with_user(data, user_id)
        return jsonify({"status": "success", "id": movement_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# READ ALL
@movements_bp.route("", methods=["GET"])
@jwt_required()
@swag_from("../../docs/movements/list_movements.yml")
def list_movements():
    movement_model = Movement()
    return jsonify(movement_model.get_all()), 200


# READ BY ID
@movements_bp.route("/<int:movement_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/movements/get_movement.yml")
def get_movement(movement_id):
    movement_model = Movement()
    movement = movement_model.get_by_id(movement_id)

    if not movement:
        return jsonify({"error": "Movement not found"}), 404

    return jsonify(movement), 200


# READ BY EQUIPMENT
@movements_bp.route("/equipment/<int:equipment_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/movements/get_movements_by_equipment.yml")
def get_movements_by_equipment(equipment_id):
    movement_model = Movement()
    return jsonify(movement_model.get_by_equipment(equipment_id)), 200
