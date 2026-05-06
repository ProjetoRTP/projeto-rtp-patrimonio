from modules.equipments.classes.generic_type import Generic_type
from database.connection import engine, meta
from sqlalchemy import select

class GenericTypeService():
    
    @property
    def type(self):
        return Generic_type()
    
    @property
    def table(self):
        return meta.tables['tipo_generico']

    def get_by_id(self, id):
        with engine.connect() as conn:
            result = conn.execute(
                select(self.table)
                .where(self.table.c.id == id)
            ).fetchone()
            if result:
                data = dict(result._mapping)
                data['atributos'] = self.get_attributes(id)
                return data
            return None
        
    def create(self, data):
        atributos = data.pop('atributos', [])
        type_id = self.type.create(data)
        
        if atributos:
            import json
            with engine.begin() as conn:
                attr_table = meta.tables['atributos_tipo_generico']
                for attr in atributos:
                    attr['tipo_id'] = type_id
                    if 'opcoes' in attr and isinstance(attr['opcoes'], list):
                        attr['opcoes'] = json.dumps(attr['opcoes'])
                    conn.execute(attr_table.insert().values(**attr))
        return type_id
    
    def update(self, id, data):
        self.type.update(id, data)

    def soft_delete(self, id):
        self.type.soft_delete(id)

    def get_all(self):
        with engine.connect() as conn:
            result = conn.execute(
                select(self.table)
            )
            return [dict(r._mapping) for r in result]

    def get_attributes(self, type_id):
        with engine.connect() as conn:
            attr_table = meta.tables['atributos_tipo_generico']
            result = conn.execute(
                select(attr_table).where(attr_table.c.tipo_id == type_id)
            )
            import json
            atributos = []
            for r in result:
                attr = dict(r._mapping)
                if attr.get('opcoes') and isinstance(attr['opcoes'], str):
                    try:
                        attr['opcoes'] = json.loads(attr['opcoes'])
                    except:
                        pass
                atributos.append(attr)
            return atributos
