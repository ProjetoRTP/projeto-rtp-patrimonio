from modules.equipments.classes.equipments import Equipment
from modules.equipments.classes.printer import Printer
from modules.equipments.services.base_service import EquipmentService


class PrinterService(EquipmentService):

    def __init__(self):
        super().__init__('impressoras')
        self.equipment = Equipment()
        self.printer = Printer()

    def create(self, data):
        if not data.get("num_patrimonio"):
            raise Exception("num_patrimonio é obrigatório")

        self._validate_subsector(data.get("setor_id"), data.get("subsetor_id"))
        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "setor_id", "subsetor_id", "colaborador_id"}
        printer_fields = {"modelo", "tipo_imp", "coloracao",
                          "conectividade", "insumo", "descricao"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        printer_data = {k: v for k, v in data.items() if k in printer_fields}

        equipment_id = self.equipment.create({
            **eq_data,
            "tipo": "impressora",
            "status": "ativo"
        })

        self.printer.create({
            "id": equipment_id,
            **printer_data
        })

        return {"id": equipment_id}

    def update(self, id, data):
        self._validate_subsector(data.get("setor_id"), data.get("subsetor_id"))

        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "status", "setor_id", "subsetor_id", "colaborador_id"}
        printer_fields = {"modelo", "tipo_imp", "coloracao",
                          "conectividade", "insumo", "descricao"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        printer_data = {k: v for k, v in data.items() if k in printer_fields}

        if eq_data:
            self.equipment.update(id, eq_data)
        if printer_data:
            self.printer.update(id, printer_data)