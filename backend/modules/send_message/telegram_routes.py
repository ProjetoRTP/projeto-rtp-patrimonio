from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import requests
import os
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from database.generic_queries import repository
from utils.barcode import id_to_barcode

telegram_bp = Blueprint('telegram', __name__)

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
@telegram_bp.route("/send-product-tag/<int:product_id>", methods=["POST"])
def send_product_tag(product_id):

    try:

        product = repository.select_product_by_id(product_id)

        if not product:
            return jsonify({
                "success": False,
                "error": "Produto não encontrado."
            }), 404

        product_data = product[0]
        product_name = product_data["ds_produto"]
        stock = product_data["qt_estoque_atual"]

        barcode_value = id_to_barcode(product_id)

        buffer = BytesIO()

        barcode.get(
            "code128",
            barcode_value,
            writer=ImageWriter()
        ).write(buffer)

        buffer.seek(0)

        caption = (
            f"📦 *Etiqueta de Patrimônio*\n\n"
            f"🆔 *ID:* `{product_id}`\n"
            f"📌 *Produto:* {product_name}\n"
            f"📦 *Estoque Atual:* {stock}\n"
            f"🏷️ *Código:* `{barcode_value}`"
        )

        result = send_photo_to_channel(buffer, caption)

        if result.get("ok"):

            return jsonify({
                "success": True,
                "message": "Etiqueta enviada com sucesso.",
                "message_id": result["result"]["message_id"]
            }), 200

        return jsonify({
            "success": False,
            "error": result.get("description")
        }), 500

    except Exception as e:

        return jsonify({
            "success": False,
            "error": "Erro interno do servidor."
        }), 500