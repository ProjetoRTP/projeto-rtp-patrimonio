from modules.equipments.classes.equipments import Equipment
from modules.equipments.classes.printer import Printer
from modules.equipments.services.base_service import EquipmentService
from database.connection import engine, meta
from sqlalchemy import select


class PrinterService(EquipmentService):

    def __init__(self):
        super().__init__('impressoras')
        self.equipment = Equipment()
        self.printer = Printer()

    def get_by_id(self, id):
        """
        Retorna dados completos da impressora com informações de relacionamentos
        (setor e subsetor).
        """
        # Primeiro, pega os dados básicos da impressora
        data = super().get_by_id(id)
        
        if not data:
            return None
        
        # Enriquece com informações de setor e subsetor
        setores = meta.tables.get('setores')
        subsetores = meta.tables.get('subsetores')
        colaboradores = meta.tables.get('colaboradores')
        
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
    
    def get_by_status(self, status):
        data = super().get_by_status(status)
        
        if not data:
            return None
        
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