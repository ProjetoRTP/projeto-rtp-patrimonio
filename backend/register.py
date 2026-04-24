from modules.user.user_routes import user_bp
from modules.authentication.auth_routes import auth_bp
from modules.equipments.equipements_routes import equipments_bp
from modules.colaboradores.colaboradores_routes import colaborador_bp

def register_routes(app):
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(equipments_bp)
    app.register_blueprint(colaborador_bp)

