"""Tests: Authentication flow (POST /auth/login)"""
from tests.conftest import auth_header


class TestLogin:
    def test_valid_credentials_returns_token(self, client):
        resp = client.post("/auth/login", json={"cpf": "00000000001", "senha": "admin123"})
        assert resp.status_code == 200
        assert "access_token" in resp.get_json()

    def test_wrong_password_returns_401(self, client):
        resp = client.post("/auth/login", json={"cpf": "00000000001", "senha": "wrong"})
        assert resp.status_code == 401

    def test_nonexistent_user_returns_401(self, client):
        resp = client.post("/auth/login", json={"cpf": "99999999999", "senha": "pass"})
        assert resp.status_code == 401

    def test_missing_fields_returns_400(self, client):
        resp = client.post("/auth/login", json={"cpf": "00000000001"})
        assert resp.status_code == 400

    def test_empty_body_returns_400(self, client):
        resp = client.post("/auth/login", json={})
        assert resp.status_code == 400


class TestProtectedRoutes:
    def test_no_token_returns_401(self, client):
        resp = client.get("/sectors")
        assert resp.status_code == 401

    def test_invalid_token_returns_401(self, client):
        resp = client.get("/sectors", headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == 422

    def test_valid_token_allows_access(self, client, usuario_token):
        resp = client.get("/sectors", headers=auth_header(usuario_token))
        assert resp.status_code == 200
