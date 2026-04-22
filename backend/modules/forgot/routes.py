from flask import Blueprint
from flask_jwt_extended import jwt_required
from flask import Blueprint, request, jsonify
from datetime import timedelta, datetime
from config. settings import *
from functools import wraps

forgot_bp = Blueprint("forgot", __name__)

tokenSaved= {}

import secrets
import smtplib 
from email.mime.text import MIMEText

def create_token():
    return secrets.token_urlsafe(6)

def send_email(recipient, token):
    sender = "rtpsistema@gmail.com"
    password = "mjrodxblhwhjvfsh"

    menssage = MIMEText(f"Seu token de recuperação de senha é: {token}")
    menssage["Subject"] = "Recuperação de Senha"
    menssage["From"] = sender
    menssage["To"] = recipient

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender, password)
    server.send_message(menssage)
    server.quit()

@forgot_bp.route('/send-token', methods=['POST'])
def send_token():
    dados = request.get_json()
    email = dados.get("email")

    if not email:
        return jsonify({"erro": "Email obrigatório"}), 400

    try:
        user = user_obj.get_by_email(email)
        if not user:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        token = create_token()

        tokenSaved[email] = {
            "token": token,
            "expira": datetime.now() + timedelta(minutes=10)
        }

        send_email(email, token)

        return jsonify({"status": "Token enviado"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    
@forgot_bp.route('/reset-password', methods=['PUT'])
def reset_password():
    dados = request.get_json()

    email = dados.get("email")
    token = dados.get("token")
    new_password = dados.get("senha")

    if not email or not token or not new_password:
        return jsonify({"erro": "Dados incompletos"}), 400

    registro = tokenSaved.get(email)

    if not registro:
        return jsonify({"erro": "Token não encontrado"}), 400

    if registro["token"] != token:
        return jsonify({"erro": "Token inválido"}), 400

    if datetime.now() > registro["expira"]:
        return jsonify({"erro": "Token expirado"}), 400

    try:
        user_obj.update_password_by_email(email, new_password)
        del tokenSaved[email]
        return jsonify({"status": "Senha atualizada com sucesso"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 400    
