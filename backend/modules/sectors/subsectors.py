from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select


class Subsector(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('subsetores')

        if table is None:
            raise Exception("Tabela 'subsetores' não encontrada no metadata")

        super().__init__(table)

    def get_all(self, include_inactive=False):
        setores = meta.tables.get('setores')
        with engine.connect() as conn:
            query = (
                select(
                    self.table.c.id,
                    self.table.c.nome,
                    self.table.c.descricao,
                    self.table.c.setor_id,
                    self.table.c.ativo,
                    setores.c.nome.label('setor_nome')
                )
                .select_from(self.table.join(setores, self.table.c.setor_id == setores.c.id))
            )

            if not include_inactive:
                query = query.where(self.table.c.ativo == True)

            result = conn.execute(query)
            return [dict(r._mapping) for r in result]

    def get_by_id(self, id):
        setores = meta.tables.get('setores')
        with engine.connect() as conn:
            query = (
                select(
                    self.table.c.id,
                    self.table.c.nome,
                    self.table.c.descricao,
                    self.table.c.setor_id,
                    self.table.c.ativo,
                    setores.c.nome.label('setor_nome')
                )
                .select_from(self.table.join(setores, self.table.c.setor_id == setores.c.id))
                .where(self.table.c.id == id)
                .where(self.table.c.ativo == True)
            )

            result = conn.execute(query).fetchone()
            return dict(result._mapping) if result else None

    def get_by_sector(self, setor_id):
        setores = meta.tables.get('setores')
        with engine.connect() as conn:
            query = (
                select(
                    self.table.c.id,
                    self.table.c.nome,
                    self.table.c.descricao,
                    self.table.c.setor_id,
                    self.table.c.ativo,
                    setores.c.nome.label('setor_nome')
                )
                .select_from(self.table.join(setores, self.table.c.setor_id == setores.c.id))
                .where(self.table.c.setor_id == setor_id)
                .where(self.table.c.ativo == True)
            )
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]
