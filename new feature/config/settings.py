import os
from pathlib import Path
from dotenv import load_dotenv

#BASE_DIR = Path(__file__).resolve().parent.parent.parent      (alterei para parent.parent, pois o settings.py já está dentro da pasta backend, então para acessar o .env na raiz do projeto, basta subir dois níveis, ou seja, parent.parent)
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, ".env"))

# Compatibilidade: aceita DB_PASS ou DB_PASSWORD no .env
DB_DSN = os.getenv("DB_DSN")
DB_USER = os.getenv("DB_USER")
#DB_PASS = os.getenv("DB_PASS")   (alterei para aceitar tanto DB_PASS quanto DB_PASSWORD, para evitar confusão, já que em alguns lugares do código estava usando DB_PASSWORD e em outros DB_PASS, então agora ambos funcionam)

DB_PASS = os.getenv("DB_PASS") or os.getenv("DB_PASSWORD")

# Se `DB_DSN` não estiver definido, monta a partir de host/port/name
if not DB_DSN:
	db_host = os.getenv("DB_HOST", "localhost")
	db_port = os.getenv("DB_PORT", "1521")
	db_name = os.getenv("DB_NAME", "")
	if db_name:
		DB_DSN = f"{db_host}:{db_port}/{db_name}"
	else:
		DB_DSN = None