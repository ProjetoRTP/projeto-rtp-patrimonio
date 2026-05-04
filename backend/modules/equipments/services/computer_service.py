from modules.equipments.classes.equipments import Equipment
from modules.equipments.classes.computers import Computer
from modules.equipments.services.base_service import EquipmentService
from database.connection import engine, meta
from sqlalchemy import select


class ComputerService(EquipmentService):

    def __init__(self):
        super().__init__('computadores')
        self.equipment = Equipment()
        self.computer = Computer()
    
    def get_by_id(self, id):
        """
        Retorna dados completo do computador com informações de relacionamentos
        (setor e subsetor).
        """
        # Primeiro, pega os dados básicos do computador
        data = super().get_by_id(id)
        
        if not data:
            return None
        
        # Enriquece com informações de setor e subsetor
        setores = meta.tables.get('setores')
        subsetores = meta.tables.get('subsetores')
        
        with engine.connect() as conn:
            # Buscar nome do setor
            if data.get('setor_id'):
                result = conn.execute(
                    select(setores.c.nome).where(setores.c.id == data['setor_id'])
                ).fetchone()
                data['setor_nome'] = result[0] if result else 'N/A'
            
            # Buscar nome do subsetor
            if data.get('subsetor_id'):
                result = conn.execute(
                    select(subsetores.c.nome).where(subsetores.c.id == data['subsetor_id'])
                ).fetchone()
                data['subsetor_nome'] = result[0] if result else 'N/A'
        
        return data
    
    def create(self, data):
        if not data.get("num_patrimonio"):
            raise Exception("num_patrimonio é obrigatório")

        self._validate_subsector(data.get("setor_id"), data.get("subsetor_id"))

        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "setor_id", "subsetor_id"}
        computer_fields = {"os", "mem_cpu", "mem_ram", "armazenamento"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        comp_data = {k: v for k, v in data.items() if k in computer_fields}

        equipment_id = self.equipment.create({
            **eq_data,
            "tipo": "computador",
            "status": "ativo"
        })

        self.computer.create({
            "id": equipment_id,
            **comp_data
        })

        return {"id": equipment_id}


    def update(self, id, data):
        self._validate_subsector(data.get("setor_id"), data.get("subsetor_id"))

        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "status", "setor_id", "subsetor_id"}
        computer_fields = {"os", "mem_cpu", "mem_ram", "armazenamento"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        comp_data = {k: v for k, v in data.items() if k in computer_fields}

        if eq_data:
            self.equipment.update(id, eq_data)
        if comp_data:
            self.computer.update(id, comp_data)