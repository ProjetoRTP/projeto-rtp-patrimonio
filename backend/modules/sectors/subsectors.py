from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select


class Subsector(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('subsetores')

        if table is None:
            raise Exception("Tabela 'subsetores' não encontrada no metadata")

        super().__init__(table)

    def get_by_sector(self, setor_id):
        with engine.connect() as conn:
            query = (
                select(self.table)
                .where(self.table.c.setor_id == setor_id)
                .where(self.table.c.ativo == True)
            )
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]
