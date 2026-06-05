from flask import jsonify, Blueprint, request
from utils.barcode_by_image import read_image_and_delete
import os

bar_up_bp = Blueprint("barcodeup", __name__, url_prefix='/barcodeup')

@bar_up_bp.route("/upload", methods=['POST'])
def upload_barcode():
    # 1. Validações iniciais do arquivo enviado
    if 'barcode_image' not in request.files:
        return jsonify({'error': 'Nenhum arquivo recebido pelo servidor'}), 400
    
    file = request.files['barcode_image']
    if file.filename == '':
        return jsonify({'error': 'Nome do arquivo vazio'}), 400
    
    # 2. Construção dinâmica e segura do caminho (MUDANÇA AQUI)
    # Descobre onde este arquivo de rotas atual está localizado
    BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
    
    # Sobe ou navega até a pasta de destino de forma nativa.
    # Exemplo: Se este arquivo de rota está em 'backend/routes/leitor.py',
    # vamos apontar corretamente para a pasta irmã 'utils/temp_barcode'
    # Ajuste os argumentos abaixo dependendo de onde este arquivo de rota está guardado!
    caminho_pasta = os.path.join(BASE_DIR, "..", "utils", "temp_barcode")
    
    # Garante que a pasta física realmente existe antes de salvar (evita FileNotFoundError)
    os.makedirs(caminho_pasta, exist_ok=True)
    
    # Junta a pasta com o nome do arquivo de forma segura para o Windows/Linux
    caminho_salvamento = os.path.join(caminho_pasta, file.filename)
    
    # 3. Salva o arquivo no disco
    file.save(caminho_salvamento)
    
    # 4. Chama a sua função passando o caminho absoluto e seguro
    codigos_extraidos = read_image_and_delete(caminho_salvamento)
    
    # 5. Verifica se algum código foi de fato encontrado
    if not codigos_extraidos:
        return jsonify({
            'status': 'erro', 
            'message': 'Nenhum código de barras válido foi detectado na imagem.'
        }), 422
    
    # 6. Retorna o sucesso e a lista de códigos de volta para o JavaScript do Frontend
    return jsonify({
        'status': 'sucesso',
        'codigos': codigos_extraidos
    }), 200