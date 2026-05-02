import secrets
import smtplib 
import os
from email.mime.text import MIMEText
from modules.user.user import User

def create_token():
    return secrets.token_urlsafe(6)

def send_email(recipient, token):
    sender = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    user_model = User()
    user = user_model.get_by_email(recipient)
    user_name = user['nome'] 

    body = f"""
Olá, {user_name}!

Recebemos uma solicitação para redefinir a sua senha.

Para continuar com o processo de recuperação, utilize o token abaixo:

🔐 Token de recuperação: {token}

Digite esse código na página de redefinição de senha para criar uma nova senha com segurança.

⚠️ Importante:
- Este token é válido por 5 minutos.
- Não compartilhe este código com ninguém.
- Se você não solicitou a recuperação de senha, ignore este e-mail.

Caso precise de ajuda, entre em contato com o suporte do sistema.

Atenciosamente,  
Equipe de Suporte
"""

    message = MIMEText(body, "plain", "utf-8")
    message["Subject"] = "Recuperação de Senha"
    message["From"] = sender
    message["To"] = recipient

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender, password)
    server.send_message(message)
    server.quit()