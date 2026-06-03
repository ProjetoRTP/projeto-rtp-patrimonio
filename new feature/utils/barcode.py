
#Converte o ID para código de barra
def id_to_barcode(id: int, tamanho: int = 9) -> str:
    return "1" + str(id).zfill(tamanho)


#Converte o código de barra para o ID
def barcode_to_id(codigo: str) -> int:

    return int(codigo[1:])