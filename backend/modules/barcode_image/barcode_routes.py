import barcode
from barcode.writer import ImageWriter
from flask_jwt_extended import jwt_required
from flask import Blueprint, jsonify, send_file
from io import BytesIO
from utils.barcode import barcode_to_id, id_to_barcode
from modules.equipments.classes.equipments import Equipment
from sqlalchemy import text
from database.connection import engine

barcode_bp = Blueprint("barcode", __name__, url_prefix='/barcode')

#Retorna o equipamento ao ler o código de barra
@barcode_bp.route("/<string:barcode_value>", methods=["GET"])
@jwt_required()
def get_equipment_by_barcode(barcode_value):
    try:
        if len(barcode_value) < 2:
            return jsonify({"error": "Código de barras inválido."}), 400

        equip_id = barcode_to_id(barcode_value)

        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT e.*, s.nome as setor_nome, sub.nome as subsetor_nome
                FROM equipamentos e
                LEFT JOIN setores s ON e.setor_id = s.id
                LEFT JOIN subsetores sub ON e.subsetor_id = sub.id
                WHERE e.id = :id AND e.status != 'inativo'
            """), {"id": equip_id}).fetchone()
            equipment = dict(result._mapping) if result else None

        if not equipment:
            return jsonify({"error": "Equipamento não encontrado."}), 404

        return jsonify({"data": equipment}), 200

    except ValueError:
        return jsonify({"error": "Formato de código de barras inválido."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#Retorna um código de barra gerado como imagem para um determinado equipamento
@barcode_bp.route("/generate/<int:equip_id>", methods=["GET"])
@jwt_required()
def get_barcode_by_equipment(equip_id):
    try:
        service = Equipment()
        equipment = service.get_by_id(equip_id)

        if not equipment:
            return jsonify({"error": "Equipamento não encontrado."}), 404

        barcode_value = id_to_barcode(equip_id)

        buffer = BytesIO()
        barcode.get("code128", barcode_value, writer=ImageWriter()).write(buffer)
        buffer.seek(0)

        return send_file(buffer, mimetype="image/png")

    except Exception as e:
        return jsonify({"error": str(e)}), 500