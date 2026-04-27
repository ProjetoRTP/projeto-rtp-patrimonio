from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import update, insert, func

class Vinculo(BaseCRUD):
    def __init__(self):
        super().__init__(meta.tables.get('equipamento_vinculos'))

    def vincular(self, data):
        """
        data:
        {
            equipamento_id,
            colaborador_id,
            setor_id
        }
        """
        with engine.begin() as conn:
            # encerra vínculos ativos anteriores
            conn.execute(
                update(self.table)
                .where(self.table.c.equipamento_id == data['equipamento_id'])
                .where(self.table.c.ativo == True)
                .values(
                    ativo=False,
                    data_fim=func.now()
                )
            )

            # cria novo vínculo
            data['data_inicio'] = func.now()
            data['ativo'] = True

            conn.execute(insert(self.table), data)