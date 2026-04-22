from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import update

class Equipamento(BaseCRUD):
    def __init__(self):
        super().__init__(meta.tables.get('equipamentos'))

    def mudar_status(self, id, status):
        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.id == id)
                .values(status=status)
            )