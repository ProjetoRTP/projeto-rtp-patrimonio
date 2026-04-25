from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import update

class Printer(BaseCRUD):
    def __init__(self):
        table = meta.tables.get('impressoras')

        if table is None:
            raise Exception("Tabela 'impressoras' não encontrada no metadata")

        def change_status(self, id, status):
            with engine.begin() as conn:
                conn.execute(
                    update(self.table)
                    .where(self.table.c.id == id)
                    .values(status=status)
                )

        super().__init__(table)