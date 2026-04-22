from database.connection import meta
from modules.crud.base import BaseCRUD

class Colaborador(BaseCRUD):
    def __init__(self):
        super().__init__(meta.tables.get('colaboradores'))