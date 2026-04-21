from database.connection import meta
from modules.crud.base import BaseCRUD

class Usuario(BaseCRUD):
    def __init__(self):
        super().__init__(meta.tables.get('usuarios'))