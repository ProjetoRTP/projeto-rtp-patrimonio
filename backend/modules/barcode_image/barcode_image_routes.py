from flask import jsonify, Blueprint, request
from utils.barcode_by_image import decode_barcode_from_memory

bar_up_bp = Blueprint("barcodeup", __name__, url_prefix='/barcodeup')

@bar_up_bp.route("/upload", methods=['POST'])
def upload_barcode():
    # 1. Validações iniciais do arquivo enviado
    if 'barcode_image' not in request.files:
        return jsonify({'error': 'Nenhum arquivo recebido pelo servidor'}), 400
    
    file = request.files['barcode_image']
    if file.filename == '':
        return jsonify({'error': 'Nome do arquivo vazio'}), 400
    
    # 2. Lê os bytes do arquivo de imagem carregado na requisição (sem gravar no disco)
    image_bytes = file.read()
    
    # 3. Chama a função de decodificação de código de barras
    codigos_extraidos = decode_barcode_from_memory(image_bytes)
    
    # 4. Verifica se algum código foi de fato encontrado
    if not codigos_extraidos:
        return jsonify({
            'status': 'erro', 
            'message': 'Nenhum código de barras válido foi detectado na imagem.'
        }), 422
    
    # 5. Retorna o sucesso e a lista de códigos de volta para o JavaScript do Frontend
    return jsonify({
        'status': 'sucesso',
        'codigos': codigos_extraidos
    }), 200