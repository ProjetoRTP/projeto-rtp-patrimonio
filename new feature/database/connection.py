from config.settings import DB_USER, DB_PASS, DB_DSN, BASE_DIR
import oracledb
import os

#Função que garante 
def init_session(connection, requested_tag):
    with connection.cursor() as cursor:
        cursor.execute("ALTER SESSION SET NLS_COMP = 'LINGUISTIC'")
        cursor.execute("ALTER SESSION SET NLS_SORT = 'BINARY_AI'")

class Database:
    _pool = None

    @classmethod
    def initialize(cls):

        target_lib_dir = os.path.join(BASE_DIR, 'backend', 'instant_client', 'instantclient_23_4')

        # Inicializa o client usando o caminho dinâmico
        try:
            oracledb.init_oracle_client(lib_dir=target_lib_dir)
            print(f"Oracle Client inicializado em: {target_lib_dir}")
        except Exception as e:
            print(f"Erro ao localizar o Instant Client (caindo para modo Thin): {e}")

        # Inicializa os acessos ao banco no modo Thick ou Thin
        print(f"Iniciando pool com usuário: {DB_USER}")
        #Inicializa os acessos ao banco
        if cls._pool is None:
            cls._pool = oracledb.create_pool(
                user=DB_USER,
                password=DB_PASS,
                dsn=DB_DSN,
                min=2,
                max=20,
                increment=2,
                session_callback=init_session
            )
    @classmethod
    def execute(cls, sql, binds=None):
        if cls._pool is None:
            cls.initialize()

        with cls._pool.acquire() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, binds or {})
                if cursor.description:
                    columns = [d[0].lower() for d in cursor.description]
                    cursor.rowfactory = lambda *args: dict(zip(columns, args))

                if sql.strip().upper().startswith("SELECT"):
                    return cursor.fetchall()