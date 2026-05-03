from modules.user.user_routes import user_bp
from modules.authentication.authentication_routes import auth_bp
from modules.collaborator.collaborator_routes import collaborator_bp
from modules.sectors.sectors_routes import sectors_bp
from modules.sectors.subsectors_routes import subsectors_bp
from modules.equipments.computers_routes import computers_bp
from modules.equipments.printer_routes import printer_bp
from modules.equipments.peripheral_routes import peripheral_bp
from modules.maintenance.maintenance_routes import maintenances_bp
from modules.movements.movement_routes import movements_bp
from modules.history.history_routes import history_bp
from modules.reports.routes_reports import reports_bp


def register_routes(app):
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(printer_bp)
    app.register_blueprint(computers_bp)
    app.register_blueprint(collaborator_bp)
    app.register_blueprint(sectors_bp)
    app.register_blueprint(subsectors_bp)
    app.register_blueprint(peripheral_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(maintenances_bp)
    app.register_blueprint(movements_bp)
    app.register_blueprint(history_bp)
    


