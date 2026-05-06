import requests
BASE_URL = 'http://localhost:5000'
resp = requests.post(f'{BASE_URL}/auth/login', json={'email': 'admin@empresa.com', 'senha': 'admin123'})
token = resp.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

res = requests.get(f'{BASE_URL}/generics/types', headers=headers)
print("GET TYPES:", res.status_code, res.text)
