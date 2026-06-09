from .connection import Database

class GenericRepository:
    pass
    
    # def select_product_by_name(self, name):

    #     #Porcentagens para permitir busca com termo parcial
    #     name_search = f"%{name}%"

    #     query = """
    #         SELECT
    #             P.CD_PRODUTo,
    #             P.DS_PRODUTO,
    #             E.QT_ESTOQUE_ATUAL
    #         FROM PRODUTO P JOIN EST_PRO E 
    #         ON P.CD_PRODUTO = E.CD_PRODUTO 
    #         WHERE DS_PRODUTO LIKE :name
    #         """

    #     binds = {"name": name_search}

    #     return Database.execute(query, binds)

# Exporta uma instância (Singleton)
repository = GenericRepository()