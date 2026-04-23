from sqlalchemy import create_engine, MetaData
from config.settings import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

meta = MetaData()

def init_db():
    meta.reflect(bind=engine)
