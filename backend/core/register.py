from modules.user.user_routes import user_bp
from modules.authentication.authentication_routes import auth_bp
from modules.sectors.sectors_routes import sectors_bp
from modules.sectors.subsectors_routes import subsectors_bp
from modules.equipments.computers_routes import computers_bp
from modules.equipments.printer_routes import printer_bp
from modules.equipments.peripheral_routes import peripheral_bp
from modules.maintenance.maintenance_routes import maintenances_bp
from modules.movements.movement_routes import movements_bp
from modules.history.history_routes import history_bp
from modules.reports.routes_reports import reports_bp
from modules.product.product_routes import product_bp
from modules.send_message.telegram_routes import telegram_bp
from modules.barcode_image.barcode_image_routes import bar_up_bp

# Importa o blueprint de genéricos E o módulo de rotas de equipamentos genéricos
# (os dois usam o mesmo blueprint generics_bp — o import do equip_routes registra as rotas nele)
from modules.equipments.generic_type_routes import generics_bp
from modules.equipments import generic_equip_routes  # noqa: registra POST/PUT/DELETE /generics


def register_routes(app):
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(printer_bp)
    app.register_blueprint(computers_bp)
    app.register_blueprint(sectors_bp)
    app.register_blueprint(subsectors_bp)
    app.register_blueprint(peripheral_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(maintenances_bp)
    app.register_blueprint(movements_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(generics_bp)
    app.register_blueprint(product_bp, url_prefix='/products')
    app.register_blueprint(telegram_bp, url_prefix='/telegram')
    app.register_blueprint(bar_up_bp, url_prefix='/barcodeup')
