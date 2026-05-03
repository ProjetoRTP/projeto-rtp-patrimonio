from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select


class Report(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('relatorios')

        if table is None:
            raise Exception("Tabela 'relatorios' não encontrada no metadata")

        super().__init__(table)

    def get_all(self, include_inactive=False):
        """Retorna todos os relatórios ordenados por data de criação."""
        with engine.connect() as conn:
            query = select(self.table).order_by(self.table.c.data_criacao.desc())
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]

    def serialize(self, report: dict):
        if not report:
            return None
        for key, value in report.items():
            if hasattr(value, 'isoformat'):
                report[key] = value.isoformat()
        return report