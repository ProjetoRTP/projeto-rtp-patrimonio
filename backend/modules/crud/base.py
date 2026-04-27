from sqlalchemy import insert, select, update
from database.connection import engine


class BaseCRUD:
    def __init__(self, table):
        self.table = table

    def create(self, data):
        with engine.begin() as conn:
            result = conn.execute(
                insert(self.table).values(**data)
            )
            return result.inserted_primary_key[0]

    def get_all(self, include_inactive=False):
        with engine.connect() as conn:
            query = select(self.table)

            if 'ativo' in self.table.c and not include_inactive:
                query = query.where(self.table.c.ativo == True)

            result = conn.execute(query)
            return [dict(r._mapping) for r in result]

    def get_by_id(self, id):
        with engine.connect() as conn:
            query = select(self.table).where(self.table.c.id == id)

            if 'ativo' in self.table.c:
                query = query.where(self.table.c.ativo == True)

            result = conn.execute(query).fetchone()
            return dict(result._mapping) if result else None

    def update(self, id, data):
        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.id == id)
                .values(data)
            )

    def soft_delete(self, id):
        if 'ativo' not in self.table.c:
            raise Exception("Tabela não possui campo 'ativo'")

        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.id == id)
                .values(ativo=False)
            )