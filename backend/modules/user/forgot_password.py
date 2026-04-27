import secrets
import smtplib 
import os
from email.mime.text import MIMEText

def create_token():
    return secrets.token_urlsafe(6)

def send_email(recipient, token):
    sender = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    menssage = MIMEText(f"Seu token de recuperação de senha é: {token}")
    menssage["Subject"] = "Recuperação de Senha"
    menssage["From"] = sender
    menssage["To"] = recipient

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(sender, password)
    server.send_message(menssage)
    server.quit()