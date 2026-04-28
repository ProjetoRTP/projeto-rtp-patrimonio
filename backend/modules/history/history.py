from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select


class History(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('historico_equipamentos')

        if table is None:
            raise Exception("Table 'historico_equipamentos' not found in metadata")

        super().__init__(table)

    def get_all(self, include_inactive=False):
        """History has no 'ativo' field — returns all records ordered by date."""
        with engine.connect() as conn:
            query = select(self.table).order_by(self.table.c.data_evento.desc())
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]

    def get_by_equipment(self, equipment_id):
        with engine.connect() as conn:
            query = (
                select(self.table)
                .where(self.table.c.equipamento_id == equipment_id)
                .order_by(self.table.c.data_evento.desc())
            )
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]

    def get_by_type(self, event_type):
        with engine.connect() as conn:
            query = (
                select(self.table)
                .where(self.table.c.tipo_evento == event_type)
                .order_by(self.table.c.data_evento.desc())
            )
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]
