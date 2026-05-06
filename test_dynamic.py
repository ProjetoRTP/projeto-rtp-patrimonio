import requests

BASE_URL = 'http://localhost:5000'

# Login
resp = requests.post(f'{BASE_URL}/auth/login', json={'email': 'admin@empresa.com', 'senha': 'admin123'})
token = resp.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Create Type
payload = {
    "nome": "Câmera de Segurança Teste",
    "descricao": "Câmeras IP dinâmicas",
    "atributos": [
        {"chave": "resolucao", "label": "Resolução", "tipo_dado": "texto", "obrigatorio": True},
        {"chave": "ip_addr", "label": "Endereço IP", "tipo_dado": "ip", "obrigatorio": True}
    ]
}
resp = requests.post(f'{BASE_URL}/generics/types', json=payload, headers=headers)
print("CREATE TYPE:", resp.status_code, resp.text)

# The response should return the type_id. Let's assume it's id 1 if table was empty.
resp = requests.get(f'{BASE_URL}/generics/types', headers=headers)
types = resp.json()
type_id = types[-1]['id']

# Get Attributes
resp = requests.get(f'{BASE_URL}/generics/types/{type_id}/atributos', headers=headers)
print("GET ATTRS:", resp.status_code, resp.text)

# Create Equipment with JSON
equip_payload = {
    "num_patrimonio": "CAM-001",
    "tipo_id": type_id,
    "setor_id": 1,
    "observacao": "Câmera do portão",
    "atributos_dinamicos": {
        "resolucao": "1080p",
        "ip_addr": "192.168.0.100"
    }
}
resp = requests.post(f'{BASE_URL}/generics', json=equip_payload, headers=headers)
print("CREATE EQUIP:", resp.status_code, resp.text)
