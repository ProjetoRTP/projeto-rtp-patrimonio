from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import insert, func, update

class ManutencaoCRUD(BaseCRUD):
    def __init__(self):
        super().__init__(meta.tables.get('manutencoes'))

    def iniciar(self, equipamento_id, usuario_id, descricao):
        with engine.begin() as conn:
            conn.execute(insert(self.table), {
                "equipamento_id": equipamento_id,
                "usuario_id": usuario_id,
                "descricao": descricao,
                "data_inicio": func.now()
            })

    def finalizar(self, id):
        with engine.begin() as conn:
            conn.execute(
                update(self.table)
                .where(self.table.c.id == id)
                .values(data_fim=func.now())
            )