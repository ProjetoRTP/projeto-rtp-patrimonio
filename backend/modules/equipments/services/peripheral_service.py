from modules.equipments.classes.equipments import Equipment
from modules.equipments.classes.peripheral import Peripheral
from modules.equipments.services.base_service import EquipmentService
from sqlalchemy import select, update, insert
from sqlalchemy.sql import func
from database.connection import engine, meta


class PeripheralService(EquipmentService):

    def __init__(self):
        super().__init__('perifericos')
        self.equipment = Equipment()
        self.peripheral = Peripheral()
        self.components = meta.tables['equipamentos_componentes']

    def create(self, data):
        if not data.get("num_patrimonio"):
            raise Exception("num_patrimonio é obrigatório")

        self._validate_subsector(data.get("setor_id"), data.get("subsetor_id"))
        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "setor_id", "subsetor_id"}
        peripheral_fields = {"tipo_per", "descricao"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        per_data = {k: v for k, v in data.items() if k in peripheral_fields}

        equipment_id = self.equipment.create({
            **eq_data,
            "tipo": "periferico",
            "status": "ativo"
        })

        self.peripheral.create({
            "id": equipment_id,
            **per_data
        })

        return {"id": equipment_id}

    # Vincula periférico a um computador
    def link(self, computador_id, periferico_id):
        # Verifica se já existe vínculo ativo
        with engine.connect() as conn:
            existing = conn.execute(
                select(self.components)
                .where(self.components.c.computador_id == computador_id)
                .where(self.components.c.periferico_id == periferico_id)
                .where(self.components.c.ativo == True)
            ).fetchone()

        if existing:
            raise Exception("Periférico já vinculado a este computador")

        with engine.begin() as conn:
            conn.execute(
                insert(self.components).values(
                    computador_id=computador_id,
                    periferico_id=periferico_id,
                    ativo=True
                )
            )

    # Desvincula periférico de um computador
    def unlink(self, computador_id, periferico_id):
        with engine.begin() as conn:
            conn.execute(
                update(self.components)
                .where(self.components.c.computador_id == computador_id)
                .where(self.components.c.periferico_id == periferico_id)
                .where(self.components.c.ativo == True)
                .values(ativo=False, data_desvinculo=func.now())
            )

    # Lista periféricos de um computador
    def get_by_computer(self, computador_id):
        per = meta.tables['perifericos']
        eq = meta.tables['equipamentos']

        with engine.connect() as conn:
            query = (
                select(eq, per)
                .join(per, eq.c.id == per.c.id)
                .join(self.components, per.c.id == self.components.c.periferico_id)
                .where(self.components.c.computador_id == computador_id)
                .where(self.components.c.ativo == True)
                .where(eq.c.status != 'desativado')
            )
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]