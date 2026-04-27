from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import update

class Computer(BaseCRUD):
    def __init__(self):
        table = meta.tables.get('computadores')

        if table is None:
            raise Exception("Tabela 'computadores' não encontrada no metadata")

        super().__init__(table)

    def change_status(self, id, status):
        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.id == id)
                .values(status=status)
            )