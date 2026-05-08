from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select, text


class Movement(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('movimentacoes')
        if table is None:
            raise Exception("Table 'movimentacoes' not found in metadata")
        super().__init__(table)

        self.setores    = meta.tables.get('setores')
        self.subsetores = meta.tables.get('subsetores')

    def create_with_user(self, data, user_id):
        equipment_id = data["equipamento_id"]
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
            print(f"DEBUG: Definindo @usuario_logado_id = {user_id}")
            conn.execute(text("SET @usuario_logado_id = :uid"), {"uid": int(user_id)})
            result = conn.execute(self.table.insert().values(**data))
            return result.inserted_primary_key[0]

    def _base_query(self):
        t  = self.table
        so = self.setores.alias("setor_origem")
        sd = self.setores.alias("setor_destino")

        return (
            select(
                t,
                so.c.nome.label("setor_origem_nome"),
                sd.c.nome.label("setor_destino_nome"),
            )
            .outerjoin(so, t.c.setor_origem_id  == so.c.id)
            .outerjoin(sd, t.c.setor_destino_id == sd.c.id)
        )

    # Sobrescreve get_all do BaseCRUD para incluir nomes dos setores
    def get_all(self, include_inactive=False):
        with engine.connect() as conn:
            result = conn.execute(
                self._base_query().order_by(self.table.c.data_movimentacao.desc())
            )
            return [dict(r._mapping) for r in result]

    # Sobrescreve get_by_id do BaseCRUD para incluir nomes dos setores
    def get_by_id(self, id):
        with engine.connect() as conn:
            result = conn.execute(
                self._base_query().where(self.table.c.id == id)
            ).fetchone()
            return dict(result._mapping) if result else None

    def get_by_equipment(self, equipment_id):
        with engine.connect() as conn:
            result = conn.execute(
                self._base_query()
                .where(self.table.c.equipamento_id == equipment_id)
                .order_by(self.table.c.data_movimentacao.desc())
            )
            return [dict(r._mapping) for r in result]

    def listar(self, equip=None, setor=None):
        with engine.connect() as conn:
            query = self._base_query()
            if equip:
                query = query.where(self.table.c.equipamento_id == equip)
            if setor:
                query = query.where(self.table.c.setor_origem_id == setor)
            result = conn.execute(query).fetchall()
            return [dict(r._mapping) for r in result]

    def serialize_movement(self, movement: dict):
        if not movement:
            return None
        for key, value in movement.items():
            if hasattr(value, 'isoformat'):
                movement[key] = value.isoformat()
        return movement