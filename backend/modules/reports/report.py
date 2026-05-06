from database.connection import meta, engine
from modules.crud.base import BaseCRUD
from sqlalchemy import select, or_, cast, Date


class Report(BaseCRUD):

    def __init__(self):
        table = meta.tables.get('relatorios')

        if table is None:
            raise Exception("Tabela 'relatorios' não encontrada no metadata")

        super().__init__(table)

    def get_all(self, include_inactive=False):
        """Retorna todos os relatórios ordenados por data de criação."""
        with engine.connect() as conn:
            query = select(self.table).order_by(self.table.c.data_criacao.desc())
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]

    def serialize(self, report: dict):
        if not report:
            return None
        for key, value in report.items():
            if hasattr(value, 'isoformat'):
                report[key] = value.isoformat()
        return report

    def get_report_data(self, report_id):
        report = self.get_by_id(report_id)
        if not report:
            return None
        
        hist_table = meta.tables.get('historico_equipamentos')
        equip_table = meta.tables.get('equipamentos')
        
        with engine.connect() as conn:
            query = select(
                hist_table.c.id,
                hist_table.c.tipo_evento,
                hist_table.c.equipamento_id,
                equip_table.c.num_patrimonio,
                hist_table.c.referencia_id,
                hist_table.c.usuario_id,
                hist_table.c.data_evento,
                hist_table.c.descricao
            ).select_from(
                hist_table.join(equip_table, hist_table.c.equipamento_id == equip_table.c.id)
            )

            if report.get('tipo') == 'movimentacoes':
                query = query.where(hist_table.c.tipo_evento == 'movimentacao')
            elif report.get('tipo') == 'manutencoes':
                query = query.where(hist_table.c.tipo_evento.in_(['manutencao_entrada', 'manutencao_saida']))
            elif report.get('tipo') == 'equipamentos':
                query = query.where(hist_table.c.tipo_evento == 'cadastro')
                query = query.where(equip_table.c.tipo != 'generico')
            elif report.get('tipo') == 'genericos':
                query = query.where(hist_table.c.tipo_evento == 'cadastro')
                query = query.where(equip_table.c.tipo == 'generico')
            
            if report.get('data_inicio'):
                query = query.where(cast(hist_table.c.data_evento, Date) >= report['data_inicio'])
            if report.get('data_fim'):
                query = query.where(cast(hist_table.c.data_evento, Date) <= report['data_fim'])
                
            if report.get('setor_id'):
                query = query.where(equip_table.c.setor_id == report['setor_id'])
                
            if report.get('equipamento'):
                search_term = f"%{report['equipamento']}%"
                query = query.where(or_(
                    equip_table.c.num_patrimonio.like(search_term),
                    hist_table.c.descricao.like(search_term)
                ))
                
            query = query.order_by(hist_table.c.data_evento.desc())
            
            result = conn.execute(query)
            return [dict(r._mapping) for r in result]