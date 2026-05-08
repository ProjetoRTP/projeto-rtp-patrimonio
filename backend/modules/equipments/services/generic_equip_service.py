from modules.equipments.classes.equipments import Equipment
from modules.equipments.classes.generic_equip import Generic_equip
from modules.equipments.services.base_service import EquipmentService
from database.connection import engine, meta
from sqlalchemy import select


class GenericService(EquipmentService):

    def __init__(self):
        super().__init__('equipamentos_generico')
        self.equipment = Equipment()
        self.generic = Generic_equip()
    
    def get_by_id(self, id):
        data = super().get_by_id(id)
        
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

        tipo_id = data.get("tipo_id")
        if tipo_id:
            tipo_generico_table = meta.tables.get('tipo_generico')
            with engine.connect() as conn:
                tipo = conn.execute(
                    select(tipo_generico_table).where(tipo_generico_table.c.id == tipo_id)
                ).fetchone()
                if not tipo:
                    raise Exception("Tipo de equipamento não encontrado.")
                if tipo._mapping.get('ativo') in [False, 0]:
                    raise Exception("Não é possível cadastrar um equipamento com um modelo desativado.")

        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "setor_id", "subsetor_id"}
        generic_fields = {"tipo_id", "observacao", "atributos_dinamicos"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        generic_data = {k: v for k, v in data.items() if k in generic_fields}

        eq_data = self._normalize_data(eq_data)
        generic_data = self._normalize_data(generic_data)

        equipment_id = self.equipment.create({
            **eq_data,
            "tipo": "generico",
            "status": "ativo"
        })

        self.generic.create({
            "id": equipment_id,
            **generic_data
        })

        # Registrar evento no histórico para aparecer nos relatórios
        hist_table = meta.tables.get('historico_equipamentos')
        if hist_table is not None:
            with engine.begin() as conn:
                conn.execute(hist_table.insert().values(
                    equipamento_id=equipment_id,
                    usuario_id=None,
                    tipo_evento='cadastro',
                    descricao=f"Equipamento genérico '{data.get('num_patrimonio')}' cadastrado."
                ))

        return {"id": equipment_id}


    def update(self, id, data):
        self._validate_subsector(data.get("setor_id"), data.get("subsetor_id"))

        tipo_id = data.get("tipo_id")
        if tipo_id:
            tipo_generico_table = meta.tables.get('tipo_generico')
            with engine.connect() as conn:
                tipo = conn.execute(
                    select(tipo_generico_table).where(tipo_generico_table.c.id == tipo_id)
                ).fetchone()
                if not tipo:
                    raise Exception("Tipo de equipamento não encontrado.")
                # Na edição, permitimos manter o tipo se ele já for o atual do equipamento, 
                # mas não trocar para outro que esteja inativo.
                if tipo._mapping.get('ativo') in [False, 0]:
                    # Verificar se o equipamento já possui esse tipo
                    current_equip = self.generic.get_by_id(id)
                    if not current_equip or current_equip.get('tipo_id') != tipo_id:
                        raise Exception("Não é possível alterar para um modelo que está desativado.")

        equipment_fields = {"num_patrimonio", "endereco_ip", "observacao",
                            "data_aquisicao", "valor", "status", "setor_id", "subsetor_id"}
        generic_fields = {"tipo_id", "observacao", "atributos_dinamicos"}

        eq_data = {k: v for k, v in data.items() if k in equipment_fields}
        generic_data = {k: v for k, v in data.items() if k in generic_fields}

        if eq_data:
            self.equipment.update(id, self._normalize_data(eq_data))
        if generic_data:
            self.generic.update(id, self._normalize_data(generic_data))