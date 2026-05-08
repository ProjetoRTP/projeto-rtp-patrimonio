from sqlalchemy import select, update
from database.connection import engine, meta


class EquipmentService:

    def __init__(self, specific_table_name):
        self.eq = meta.tables['equipamentos']
        self.specific = meta.tables[specific_table_name]

    def _validate_subsector(self, sector_id, subsector_id):
        """
        Ensures the subsector belongs to the given sector.
        Raises an exception before reaching the database trigger,
        providing a clear error message to the client.
        """
        if subsector_id is None:
            return

        subsectors = meta.tables.get('subsetores')
        with engine.connect() as conn:
            result = conn.execute(
                select(subsectors.c.setor_id)
                .where(subsectors.c.id == subsector_id)
                .where(subsectors.c.ativo == True)
            ).fetchone()

        if result is None:
            raise Exception(f"Subsector {subsector_id} not found")

        if result.setor_id != sector_id:
            raise Exception(
                f"Subsector {subsector_id} does not belong to sector {sector_id}"
            )

    def _base_query(self):
        setores = meta.tables.get('setores')
        return (
            select(self.eq, self.specific, setores.c.nome.label('setor_nome'))
            .join(self.specific, self.eq.c.id == self.specific.c.id)
            .outerjoin(setores, self.eq.c.setor_id == setores.c.id)
            .where(self.eq.c.status != 'desativado')
        )

    def get_all(self):
        with engine.connect() as conn:
            result = conn.execute(self._base_query())
            return [dict(r._mapping) for r in result]

    def get_by_id(self, id):
        with engine.connect() as conn:
            query = self._base_query().where(self.eq.c.id == id)
            result = conn.execute(query).fetchone()
            return dict(result._mapping) if result else None
    
    def listar(self, status=None, setor=None):
        with engine.connect() as conn:
            query = self._base_query()

            if status:
                query = query.where(self.eq.c.status == status)

            if setor:
                query = query.where(self.eq.c.setor_id == setor)

            result = conn.execute(query).fetchall()
            return [dict(r._mapping) for r in result]

    def delete(self, id):
        with engine.begin() as conn:
            conn.execute(
                update(self.eq)
                .where(self.eq.c.id == id)
                .values(status='desativado')
            )
    
    def _normalize_data(self, data):
        """
        Normaliza os dados para o banco, convertendo strings vazias em None (NULL).
        Isso evita erros de UNIQUE CONSTRAINT em campos opcionais (ex: endereco_ip).
        """
        normalized = {}
        for k, v in data.items():
            if isinstance(v, str) and v.strip() == "":
                normalized[k] = None
            else:
                normalized[k] = v
        return normalized
