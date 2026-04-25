from modules.user.user_routes import user_bp
from backend.modules.authentication.authentication_routes import auth_bp
from backend.modules.collaborator.collaborator_routes import collaborator_bp
from modules.sectors.sectors_routes import sectors_bp
from modules.equipments.computers_routes import computers_bp
from modules.equipments.printer_routes import printer_bp

def register_routes(app):
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(printer_bp)
    app.register_blueprint(computers_bp)
    app.register_blueprint(collaborator_bp)
    app.register_blueprint(sectors_bp)

