from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import update, select
class User(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('usuarios')

        if table is None:
            raise Exception("Tabela 'usuarios' não encontrada no metadata")

        super().__init__(table)

    def mudar_status(self, id, status):
        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.id == id)
                .values(status=status)
            )

    def get_by_email(self, email):
        with engine.connect() as conn:
            query = select(self.table).where(self.table.c.email == email)
            result = conn.execute(query).fetchone()

            if result:
                return dict(result._mapping)

            return None

    def update_password_by_email(self, email, new_password):
        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.email == email)
                .values(senha=new_password)
            )

    def get_by_cpf(self, cpf):
        with engine.connect() as conn:
            query = select(self.table).where(self.table.c.cpf == cpf)
            result = conn.execute(query).fetchone()

            if result:
                return dict(result._mapping)

            return None