from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import update

class Equipments(BaseCRUD):
    def __init__(self):
        table = meta.tables.get('equipamentos')

        if table is None:
            raise Exception("Tabela 'equipamentos' não encontrada no metadata")

        def mudar_status(self, id, status):
            with engine.begin() as conn:
                conn.execute(
                    update(self.table)
                    .where(self.table.c.id == id)
                    .values(status=status)
                )

        super().__init__(table)