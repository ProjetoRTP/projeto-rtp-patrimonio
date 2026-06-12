from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import requests
import os
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from database.generic_queries import repository
from utils.barcode import id_to_barcode

telegram_bp = Blueprint('telegram', __name__, url_prefix='/telegram')

# Dados necessários para envio
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"
CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID")

# Auxiliar para envio de mensagem de texto
def send_message_to_channel(text: str, parse_mode: str = "Markdown") -> dict:
    response = requests.post(f"{TELEGRAM_API}/sendMessage", json={
        "chat_id": CHANNEL_ID,
        "text": text,
        "parse_mode": parse_mode
    })
    return response.json()


# Auxiliar para envio de foto (barcode)
def send_photo_to_channel(photo_bytes, caption: str, parse_mode: str = "Markdown") -> dict:
    files = {'photo': ('barcode.png', photo_bytes, 'image/png')}
    data = {
        "chat_id": CHANNEL_ID,
        "caption": caption,
        "parse_mode": parse_mode
    }
    response = requests.post(f"{TELEGRAM_API}/sendPhoto", data=data, files=files)
    return response.json()


# Envia a mensagem de texto para o canal
@telegram_bp.route("/send", methods=["POST"])
@jwt_required()
def send_message():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        message = data.get("message")
        parse_mode = data.get("parse_mode", "Markdown")

        if not message:
            return jsonify({"error": "O campo 'message' é obrigatório"}), 400

        result = send_message_to_channel(message, parse_mode)

        if result.get("ok"):
            return jsonify({
                "success": True,
                "message_id": result["result"]["message_id"]
            }), 200

        return jsonify({
            "success": False,
            "error": result.get("description", "Erro ao enviar mensagem")
        }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


#Envia a mensagem completa, dados do produto com o código de barras
@telegram_bp.route("/send-equipment-tag/<int:equip_id>", methods=["POST"])
@jwt_required()
def send_equipment_tag(equip_id):

    try:
        from modules.equipments.services.generic_type_service import GenericTypeService
        from sqlalchemy import select, func, text
        from database.connection import engine, meta

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
            return jsonify({
                "success": False,
                "error": "Equipamento não encontrado."
            }), 404

        num_patrimonio = equipment.get("num_patrimonio", "N/A")
        setor_nome = equipment.get("setor_nome") or "N/A"
        subsetor_nome = equipment.get("subsetor_nome") or "N/A"
        tipo_id = equipment.get("tipo_id")

        tipo_map = {
            "computador": "Computador",
            "impressora": "Impressora",
            "periferico": "Periférico",
            "generico": "Genérico"
        }
        tipo_nome = tipo_map.get(equipment.get("tipo"), "Desconhecido")

        ativos = 0
        inativos = 0

        if tipo_id:
            tipo = GenericTypeService().get_by_id(tipo_id)
            if tipo:
                tipo_nome = tipo.get("nome", tipo_nome)

            equip_table = meta.tables['equipamentos']
            gen_table = meta.tables['equipamentos_generico']

            with engine.connect() as conn:
                query = select(equip_table.c.status, func.count(equip_table.c.id)).select_from(
                    equip_table.join(gen_table, equip_table.c.id == gen_table.c.id)
                ).where(gen_table.c.tipo_id == tipo_id).group_by(equip_table.c.status)

                counts = dict(conn.execute(query).fetchall())
                ativos = counts.get('ativo', 0)
                inativos = counts.get('desativado', 0) + counts.get('inativo', 0)

        barcode_value = id_to_barcode(equip_id)

        buffer = BytesIO()
        barcode.get("code128", barcode_value, writer=ImageWriter()).write(buffer)
        buffer.seek(0)

        caption = (
            f"📦 *Etiqueta de Patrimônio*\n\n"
            f"🆔 *ID:* `{equip_id}`\n"
            f"📌 *Patrimônio:* {num_patrimonio}\n"
            f"🏷️ *Modelo:* {tipo_nome}\n"
            f"🏢 *Setor:* {setor_nome} / {subsetor_nome}\n"
            f"📊 *Estatísticas do Modelo:*\n"
            f"   ✅ *Ativos:* {ativos}\n"
            f"   ❌ *Inativos/Desativados:* {inativos}\n"
            f"📷 *Código:* `{barcode_value}`"
        )

        result = send_photo_to_channel(buffer, caption)

        if result.get("ok"):
            return jsonify({
                "success": True,
                "message": "Etiqueta enviada com sucesso.",
                "message_id": result["result"]["message_id"]
            }), 200

        print(f"Erro na API do Telegram: {result}")
        return jsonify({
            "success": False,
            "error": result.get("description")
        }), 500

    except Exception as e:
        print(f"Erro interno ao enviar para o Telegram: {str(e)}", flush=True)
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor."
        }), 500