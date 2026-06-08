import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from database.connection import init_db
from flask_jwt_extended import JWTManager
from core.register import register_routes
from flasgger import Swagger

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type", "Authorization"],
             "supports_credentials": False,
             "max_age": 3600
         }})

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-inseguro")
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]

    JWTManager(app)

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

    init_db()

    register_routes(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
