from modules.product.product_routes import product_bp
from modules.send_message.telegram_routes import telegram_bp
from modules.barcode_image.barcode_image_routes import bar_up_bp

def register_routes(app):
    app.register_blueprint(product_bp, url_prefix='/products')
    app.register_blueprint(telegram_bp, url_prefix='/telegram')
    app.register_blueprint(bar_up_bp, url_prefix='/barcodeup')