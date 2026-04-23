from modules.user.user_routes import user_bp
from modules.authentication.auth_routes import auth_bp

def register_routes(app):
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
