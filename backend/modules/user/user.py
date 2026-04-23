from database.connection import meta
from modules.crud.base import BaseCRUD

class User(BaseCRUD):
    def __init__(self):
        table = meta.tables.get('usuarios')

        if table is None:
            raise Exception("Tabela 'usuarios' não encontrada no metadata")

        super().__init__(table)