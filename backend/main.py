from flask import Flask, jsonify
from flask_cors import CORS
from routes.register import register_routes


def create_app():
    app = Flask(__name__)
    CORS(app)
    register_routes(app)

    @app.route("/")
    def hello():
        return jsonify({"message": "Hello, World!", "status": "ok"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
