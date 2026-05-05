from modules.equipments.classes.generic_type import Generic_type
from database.connection import engine, meta
from sqlalchemy import select

class GenericTypeService():
    def __init__(self):
        self.type = Generic_type()
        self.table = meta.tables['tipo_generico']

    def get_by_id(self, id):
        with engine.connect() as conn:
            result = conn.execute(
                select(self.table)
                .where(self.table.c.id == id)
            ).fetchone()
        
    def create(self, data):
        self.type.create(data)
    
    def update(self, id, data):
        self.type.update(id, data)

    def soft_delete(self, id):
        self.type.soft_delete(id)

    def get_all(self):
        with engine.connect() as conn:
            result = conn.execute(
                select(self.table)
            )
            return [dict(r._mapping) for r in result]
