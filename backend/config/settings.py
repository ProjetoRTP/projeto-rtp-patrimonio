import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_PORT = int(os.getenv("MYSQL_PORT", 3306))
DB_NAME = os.getenv("MYSQL_DATABASE", "patrimonio")
DB_USER = os.getenv("MYSQL_USER", "patrimonio_user")
DB_PASS = os.getenv("MYSQL_PASSWORD", "patrimonio_pass")

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "default_secret")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))

settings = Settings()