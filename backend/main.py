from flask import Flask
from flask_cors import CORS
from database.connection import init_db
from flask_jwt_extended import JWTManager
from register import register_routes

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["JWT_SECRET_KEY"] = "key"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]

    JWTManager(app)

    init_db()   

    register_routes(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
