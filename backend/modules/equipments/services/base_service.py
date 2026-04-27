from sqlalchemy import select, update
from database.connection import engine, meta


class EquipmentService:

    def __init__(self, specific_table_name):
        self.eq = meta.tables['equipamentos']
        self.specific = meta.tables[specific_table_name]

    def _base_query(self):
        return (
            select(self.eq, self.specific)
            .join(self.specific, self.eq.c.id == self.specific.c.id)
            .where(self.eq.c.status != 'desativado')
        )

    def get_all(self):
        with engine.connect() as conn:
            result = conn.execute(self._base_query())
            return [dict(r._mapping) for r in result]

    def get_by_id(self, id):
        with engine.connect() as conn:
            query = self._base_query().where(self.eq.c.id == id)
            result = conn.execute(query).fetchone()
            return dict(result._mapping) if result else None

    def delete(self, id):
        with engine.begin() as conn:
            conn.execute(
                update(self.eq)
                .where(self.eq.c.id == id)
                .values(status='desativado')
            )