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

    def delete(self, id):
        from sqlalchemy import delete, select
        from sqlalchemy.exc import IntegrityError
        
        print(f"DEBUG: Tentando excluir tipo_generico id={id}")
        
        # 1. Verificar se existem EQUIPAMENTOS vinculados a este modelo
        equip_table = meta.tables.get('equipamentos_generico')
        with engine.connect() as conn:
            query = select(equip_table.c.id).where(equip_table.c.tipo_id == id).limit(1)
            has_equips = conn.execute(query).fetchone()
            print(f"DEBUG: Equipamentos vinculados encontrados? {has_equips}")
            
            if has_equips:
                raise Exception("Não é possível excluir permanentemente este modelo pois existem equipamentos (ativos ou inativos) vinculados a ele. Utilize a opção de 'Desativar'.")

        # 2. Tentar deletar (incluindo atributos)
        attr_table = meta.tables.get('atributos_tipo_generico')
        try:
            with engine.begin() as conn:
                # Deletar atributos primeiro (devido à Foreign Key)
                conn.execute(delete(attr_table).where(attr_table.c.tipo_id == id))
                # Deletar o modelo
                conn.execute(delete(self.table).where(self.table.c.id == id))
                print(f"DEBUG: Modelo {id} excluído com sucesso.")
        except IntegrityError:
             raise Exception("Erro de integridade: existem vínculos no banco de dados que impedem a exclusão. Tente desativar o modelo.")
        except Exception as e:
            print(f"DEBUG: Erro ao excluir: {str(e)}")
            raise Exception(f"Erro técnico ao excluir modelo: {str(e)}")

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
