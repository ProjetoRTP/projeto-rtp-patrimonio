from .connection import Database

class GenericRepository:

    def select_all_products(self):
        query = """
        SELECT 
            P.CD_PRODUTO, 
            P.DS_PRODUTO,
            E.QT_ESTOQUE_ATUAL
        FROM PRODUTO P
        JOIN EST_PRO E
        ON P.CD_PRODUTO = E.CD_PRODUTO
        WHERE E.CD_ESTOQUE = 1
        AND P.CD_ESPECIE = 10
        """
        result = Database.execute(query)
        return result

    def select_product_by_id(self, id):
        query = """
        SELECT 
            A.CD_PRODUTO,
            A.DS_PRODUTO, 
            B.QT_ESTOQUE_ATUAL 
        FROM PRODUTO A 
        JOIN EST_PRO B 
        ON A.CD_PRODUTO = B.CD_PRODUTO
        WHERE A.CD_PRODUTO = :id
        AND B.CD_ESTOQUE = 1
        AND A.CD_ESPECIE = 10
        """
        binds = {"id": id}
        result = Database.execute(query, binds)
        if result:
            return result
        return None
    
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