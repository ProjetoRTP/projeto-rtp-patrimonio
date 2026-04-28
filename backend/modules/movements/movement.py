from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select, text


class Movement(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('movimentacoes')

        if table is None:
            raise Exception("Table 'movimentacoes' not found in metadata")

        super().__init__(table)

    def create_with_user(self, data, user_id):
        """
        Creates a movement record.
        - Automatically fills setor_origem_id and subsetor_origem_id from the
          equipment's current location (client only needs setor_destino_id).
        - Sets @usuario_logado_id session variable so the trigger trg_movimentacao
          can register the correct user in historico_equipamentos.
        """
        equipment_id = data["equipamento_id"]

        # Fetch current equipment location to fill origin fields
        equipamentos = meta.tables.get('equipamentos')
        with engine.connect() as conn:
            row = conn.execute(
                select(
                    equipamentos.c.setor_id,
                    equipamentos.c.subsetor_id
                ).where(equipamentos.c.id == equipment_id)
            ).fetchone()

        if row is None:
            raise Exception(f"Equipment {equipment_id} not found")

        data["setor_origem_id"]    = row.setor_id
        data["subsetor_origem_id"] = row.subsetor_id

        with engine.begin() as conn:
            conn.execute(text(f"SET @usuario_logado_id = {int(user_id)}"))
            result = conn.execute(
                self.table.insert().values(**data)
            )
            return result.inserted_primary_key[0]

    def get_by_equipment(self, equipment_id):
        with engine.connect() as conn:
            query = (
                select(self.table)
                .where(self.table.c.equipamento_id == equipment_id)
                .order_by(self.table.c.data_movimentacao.desc())
            )
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]
