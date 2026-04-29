"""Tests: Role-based access control (RBAC)"""
from tests.conftest import auth_header


class TestSectorRoles:
    """Sectors can be created/edited/deleted by admin and gerente only."""

    def test_usuario_cannot_create_sector(self, client, usuario_token):
        resp = client.post(
            "/sectors",
            json={"nome": "RH"},
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 403

    def test_gerente_can_create_sector(self, client, gerente_token):
        resp = client.post(
            "/sectors",
            json={"nome": "RH"},
            headers=auth_header(gerente_token),
        )
        assert resp.status_code == 201

    def test_admin_can_create_sector(self, client, admin_token):
        resp = client.post(
            "/sectors",
            json={"nome": "Financeiro"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 201


class TestUserManagementRoles:
    """User management (POST /users) is admin-only."""

    def test_usuario_cannot_create_user(self, client, usuario_token):
        resp = client.post(
            "/users",
            json={
                "nome": "Novo", "cpf": "11111111111",
                "email": "novo@test.com", "senha": "123456",
                "data_nascimento": "1995-01-01",
            },
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 403

    def test_gerente_cannot_create_user(self, client, gerente_token):
        resp = client.post(
            "/users",
            json={
                "nome": "Novo", "cpf": "11111111111",
                "email": "novo@test.com", "senha": "123456",
                "data_nascimento": "1995-01-01",
            },
            headers=auth_header(gerente_token),
        )
        assert resp.status_code == 403

    def test_admin_can_create_user(self, client, admin_token):
        resp = client.post(
            "/users",
            json={
                "nome": "Novo User", "cpf": "11111111111",
                "email": "novo@test.com", "senha": "123456",
                "data_nascimento": "1995-01-01",
            },
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 201


class TestEquipmentRoles:
    """Any authenticated user can register; only gerente/admin can edit/delete."""

    def test_usuario_can_register_computer(self, client, usuario_token, sector):
        resp = client.post(
            "/computers",
            json={
                "num_patrimonio": "PC-ROLE-01",
                "os": "Windows 11", "mem_cpu": "i3",
                "mem_ram": "8GB", "armazenamento": "256GB SSD",
                "setor_id": sector["id"],
            },
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 201

    def test_usuario_cannot_delete_computer(self, client, usuario_token, computer):
        resp = client.delete(
            f"/computers/{computer['id']}",
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 403

    def test_gerente_can_delete_computer(self, client, gerente_token, computer):
        resp = client.delete(
            f"/computers/{computer['id']}",
            headers=auth_header(gerente_token),
        )
        assert resp.status_code == 200
