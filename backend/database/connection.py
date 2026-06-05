from sqlalchemy import create_engine, MetaData, text
from config.settings import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
import re

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10, pool_recycle=3600)

meta = MetaData()

def init_db():
    meta.reflect(bind=engine)

class Database:

    @classmethod
    def execute(cls, sql, binds=None):
        # Converte sintaxe Oracle (:param) para SQLAlchemy (:param é compatível!)
        with engine.connect() as conn:
            result = conn.execute(text(sql), binds or {})

            if sql.strip().upper().startswith("SELECT"):
                columns = [col.lower() for col in result.keys()]
                return [dict(zip(columns, row)) for row in result.fetchall()]
