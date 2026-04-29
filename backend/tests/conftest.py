"""
E2E Test Suite — RTP Patrimônio Backend
========================================
Strategy:
  - Uses a dedicated 'patrimonio_test' MySQL database (same Docker instance).
  - Session-scoped fixture creates the DB and applies the full schema (including triggers).
  - Function-scoped autouse fixture truncates all tables and reseeds 3 users
    (admin/gerente/usuario) before every test — guarantees test isolation.
  - Tokens are obtained via the real /auth/login endpoint (true E2E).

Requirements:
  - Docker MySQL container must be running (docker compose up db).
  - Root credentials must be available (see .env: MYSQL_ROOT_PASSWORD).
"""

import os

# ── MUST be set BEFORE any app module is imported ─────────────────────────────
os.environ["MYSQL_DATABASE"] = "patrimonio_test"
os.environ["JWT_SECRET_KEY"]  = "test-secret-key-e2e-suite"
os.environ["MYSQL_HOST"]      = os.environ.get("MYSQL_HOST", "localhost")
os.environ["MYSQL_PORT"]      = os.environ.get("MYSQL_PORT", "3306")
# Tests connect as root so we have CREATE/DROP DATABASE privileges
os.environ["MYSQL_USER"]     = "root"
os.environ["MYSQL_PASSWORD"] = os.environ.get("MYSQL_ROOT_PASSWORD", "rootpass")
# ──────────────────────────────────────────────────────────────────────────────

import pytest
import pymysql
import bcrypt
from pathlib import Path


# ── Helpers ───────────────────────────────────────────────────────────────────

def _root_conn(database: str | None = None):
    """Open a raw PyMySQL connection as root."""
    kwargs = dict(
        host=os.environ["MYSQL_HOST"],
        port=int(os.environ["MYSQL_PORT"]),
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        charset="utf8mb4",
        autocommit=True,
    )
    if database:
        kwargs["database"] = database
    return pymysql.connect(**kwargs)


def _parse_sql(sql_text: str) -> list:
    """
    Parse a MySQL SQL file that uses DELIMITER blocks into a list of
    individual executable statements (without the delimiter token).

    Handles DELIMITER $$ and DELIMITER // blocks used for stored procedures
    and triggers, as well as regular semicolon-terminated statements.
    """
    statements = []
    current_delimiter = ";"
    buffer = []

    for line in sql_text.splitlines():
        stripped = line.strip()

        # Skip empty lines and pure comment lines
        if not stripped or stripped.startswith("--"):
            continue

        # DELIMITER change directive
        if stripped.upper().startswith("DELIMITER"):
            parts = stripped.split()
            if len(parts) >= 2:
                current_delimiter = parts[1]
            continue

        buffer.append(line)
        combined = "\n".join(buffer).strip()

        if combined.endswith(current_delimiter):
            stmt = combined[: -len(current_delimiter)].strip()
            if stmt:
                statements.append(stmt)
            buffer = []

    return statements


def auth_header(token: str) -> dict:
    """Build the Authorization header dict for Flask test client calls."""
    return {"Authorization": f"Bearer {token}"}


# ── Database fixtures ─────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def setup_database():
    """
    Session-scoped: create patrimonio_test database and apply the full schema
    (tables, indexes, triggers) exactly once per test run.
    Drops and recreates the database to guarantee a clean slate.
    """
    # 1. Drop and recreate
    conn = _root_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DROP DATABASE IF EXISTS patrimonio_test")
            cur.execute(
                "CREATE DATABASE patrimonio_test "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
    finally:
        conn.close()

    # 2. Load and patch the SQL schema
    sql_path = (
        Path(__file__).parent.parent / "database" / "script" / "patrimonio.sql"
    )
    sql_text = sql_path.read_text(encoding="utf-8")

    # Redirect all database references to the test database
    sql_text = sql_text.replace(
        "CREATE DATABASE IF NOT EXISTS patrimonio",
        "-- test db already created"
    )
    sql_text = sql_text.replace("USE patrimonio;", "USE patrimonio_test;")
    sql_text = sql_text.replace("ON patrimonio.*", "ON patrimonio_test.*")

    # 3. Execute schema (tables + indexes + triggers)
    statements = _parse_sql(sql_text)
    conn = _root_conn("patrimonio_test")
    try:
        with conn.cursor() as cur:
            for stmt in statements:
                try:
                    cur.execute(stmt)
                except pymysql.err.OperationalError as exc:
                    # Ignore "already exists" warnings for idempotent schema
                    if exc.args[0] not in (1050, 1061, 1630):
                        raise
    finally:
        conn.close()

    yield

    # Teardown: drop the test database after the session ends
    conn = _root_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DROP DATABASE IF EXISTS patrimonio_test")
    finally:
        conn.close()


@pytest.fixture(autouse=True)
def clean_and_seed(setup_database):
    """
    Function-scoped + autouse: runs before every test.
    Truncates all tables (FK checks disabled) and reseeds 3 system users:
      - admin    / admin123
      - gerente  / gerente123
      - usuario  / usuario123
    """
    # Truncation order respects reverse FK dependencies
    tables = [
        "historico_equipamentos",
        "movimentacoes",
        "manutencoes",
        "equipamentos_componentes",
        "computadores",
        "impressoras",
        "perifericos",
        "equipamentos",
        "colaboradores",
        "subsetores",
        "setores",
        "usuarios",
    ]

    conn = _root_conn("patrimonio_test")
    try:
        with conn.cursor() as cur:
            cur.execute("SET FOREIGN_KEY_CHECKS = 0")
            for table in tables:
                cur.execute(f"TRUNCATE TABLE {table}")
            cur.execute("SET FOREIGN_KEY_CHECKS = 1")

            # Seed the three system users with bcrypt-hashed passwords
            users = [
                ("Admin Test",    "00000000001", "admin@test.com",   "admin123",   "admin"),
                ("Gerente Test",  "00000000002", "gerente@test.com", "gerente123", "gerente"),
                ("Usuario Test",  "00000000003", "usuario@test.com", "usuario123", "usuario"),
            ]
            for nome, cpf, email, senha, perfil in users:
                hashed = bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()
                cur.execute(
                    """INSERT INTO usuarios
                       (nome, cpf, email, data_nascimento, senha, perfil)
                       VALUES (%s, %s, %s, '1990-01-01', %s, %s)""",
                    (nome, cpf, email, hashed, perfil),
                )
    finally:
        conn.close()


# ── Flask app & client ────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def app(setup_database):
    """
    Session-scoped Flask application pointing at patrimonio_test.
    create_app() → init_db() reflects the test database schema.
    """
    from main import create_app  # import AFTER env vars are set

    flask_app = create_app()
    flask_app.config["TESTING"] = True
    return flask_app


@pytest.fixture
def client(app):
    """Function-scoped test client — fresh per test."""
    return app.test_client()


# ── Auth token fixtures ───────────────────────────────────────────────────────

def _get_token(client, cpf: str, password: str) -> str:
    resp = client.post("/auth/login", json={"cpf": cpf, "senha": password})
    assert resp.status_code == 200, f"Login failed for {cpf}: {resp.get_json()}"
    return resp.get_json()["access_token"]


@pytest.fixture
def admin_token(client):
    return _get_token(client, "00000000001", "admin123")


@pytest.fixture
def gerente_token(client):
    return _get_token(client, "00000000002", "gerente123")


@pytest.fixture
def usuario_token(client):
    return _get_token(client, "00000000003", "usuario123")


# ── Reusable resource fixtures ────────────────────────────────────────────────

@pytest.fixture
def sector(client, admin_token):
    """Creates and returns a sector via the API."""
    resp = client.post(
        "/sectors",
        json={"nome": "TI", "descricao": "Setor de Tecnologia"},
        headers=auth_header(admin_token),
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert "id" in data, f"ID missing in sector response: {data}"
    return data


@pytest.fixture
def subsector(client, admin_token, sector):
    """Creates and returns a subsector inside the 'TI' sector."""
    sector_id = sector["id"]
    resp = client.post(
        "/subsectors",
        json={"nome": "Infraestrutura", "setor_id": sector_id},
        headers=auth_header(admin_token),
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert "id" in data, f"ID missing in subsector response: {data}"
    return {**data, "setor_id": sector_id}


@pytest.fixture
def computer(client, usuario_token, sector):
    """Creates and returns a computer via the API (any authenticated user can)."""
    resp = client.post(
        "/computers",
        json={
            "num_patrimonio": "PC-001",
            "os": "Ubuntu 22.04",
            "mem_cpu": "Intel i5",
            "mem_ram": "16GB",
            "armazenamento": "512GB SSD",
            "setor_id": sector["id"],
        },
        headers=auth_header(usuario_token),
    )
    assert resp.status_code == 201
    return resp.get_json()
