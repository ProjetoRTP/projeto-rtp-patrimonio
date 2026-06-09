import cv2
import numpy as np
from pyzbar.pyzbar import decode

def decode_barcode_from_memory(image_bytes):
    # 1. Converte os bytes em um array NumPy
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # 2. Decodifica o array como imagem com OpenCV (mantém colorida ou grayscale)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Cria uma lista para armazenar os códigos encontrados
    resultados = []

    # 3. Se a imagem foi carregada com sucesso, processa com o pyzbar
    if image is not None:
        codes = decode(image)
        for c in codes:
            infos = c.data.decode("utf-8")
            # Adiciona o código limpo à nossa lista
            resultados.append(infos)
    else:
        print("Aviso: Não foi possível decodificar os bytes da imagem (formato inválido ou corrompido).")

    # 4. Retorna a lista de códigos encontrados (ficará vazia se não achar nenhum)
    return resultados