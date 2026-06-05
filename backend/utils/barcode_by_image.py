import cv2
from pyzbar.pyzbar import decode
import os

def read_image_and_delete(image_dir):
    # 1. Carrega a imagem
    image = cv2.imread(image_dir)

    # Cria uma lista para armazenar os códigos encontrados
    resultados = []

    # 2. Se a imagem foi carregada com sucesso, processa com o pyzbar
    if image is not None:
        codes = decode(image)
        for c in codes:
            infos = c.data.decode("utf-8")
            # Adiciona o código limpo à nossa lista
            resultados.append(infos)
    else:
        print(f"Aviso: Não foi possível ler o arquivo {image_dir} (pode estar corrompido ou inexistente).")

    # 3. DELETA A IMAGEM DA PASTA
    # Usamos um try/except para evitar que o sistema trave caso o arquivo sumida antes
    if os.path.exists(image_dir):
        try:
            os.remove(image_dir)
            print(f"Sucesso: Arquivo {image_dir} deletado com segurança.")
        except Exception as e:
            print(f"Erro ao tentar deletar o arquivo: {e}")

    # 4. Retorna a lista de códigos encontrados (ficará vazia se não achar nenhum)
    return resultados

# --- Exemplo de como você vai chamar ela no seu código principal ---
caminho_arquivo = "backend/utils/Teste.png"
codigos_encontrados = read_image_and_delete(caminho_arquivo)

# Agora você pode usar o resultado como quiser:
print("Códigos retornados pela função:", codigos_encontrados)