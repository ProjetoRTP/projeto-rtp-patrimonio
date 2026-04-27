from modules.equipments.classes.equipments import Equipment
from modules.equipments.classes.computers import Computer
from modules.equipments.services.base_service import EquipmentService


class ComputerService(EquipmentService):

    def __init__(self):
        super().__init__('computadores')
        self.equipment = Equipment()
        self.computer = Computer()
    
    def create(self, data):
        if not data.get("num_patrimonio"):
            raise Exception("num_patrimonio é obrigatório")


        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "setor_id", "colaborador_id"}
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
        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "status", "setor_id", "colaborador_id"}
        computer_fields = {"os", "mem_cpu", "mem_ram", "armazenamento"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        comp_data = {k: v for k, v in data.items() if k in computer_fields}

        if eq_data:
            self.equipment.update(id, eq_data)
        if comp_data:
            self.computer.update(id, comp_data)