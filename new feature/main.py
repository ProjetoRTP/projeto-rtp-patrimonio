import os
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from dotenv import load_dotenv
from database.connection import Database
from database.generic_queries import repository
from flask_jwt_extended import JWTManager
from core.register import register_routes

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})



    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-inseguro")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]

    JWTManager(app)
    register_routes(app)

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "API RTP Patrimônio",
            "description": "Documentação interativa da API do sistema de Patrimônio.",
            "version": "1.0.0"
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "⚠️ **AVISO IMPORTANTE:**\\nVocê **DEVE** digitar a palavra `Bearer` seguida de um espaço antes do seu token!\\n\\n**Exemplo correto:** `Bearer eyJhbGciOiJIUzI1NiIs...`"
            }
        },
    }
    Swagger(app, template=swagger_template)

    try:
        Database.initialize()
        print("Banco de dados carregado.")

    except Exception as e:
        print(f"Erro ao iniciar: {e}")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0")