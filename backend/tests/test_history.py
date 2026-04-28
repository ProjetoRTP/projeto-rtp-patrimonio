"""Tests: History endpoint (read-only, auto-populated by triggers)"""
from tests.conftest import auth_header


class TestHistory:
    def test_list_history(self, client, usuario_token):
        resp = client.get("/history", headers=auth_header(usuario_token))
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)

    def test_history_by_equipment_after_movement(
        self, client, usuario_token, admin_token, computer, sector
    ):
        """A movement must create a 'movimentacao' event in history."""
        dest_resp = client.post(
            "/sectors", json={"nome": "Destino"}, headers=auth_header(admin_token)
        )
        dest_id = dest_resp.get_json()["id"]

        client.post(
            "/movements",
            json={"equipamento_id": computer["id"], "setor_destino_id": dest_id},
            headers=auth_header(usuario_token),
        )

        resp = client.get(
            f"/history/equipment/{computer['id']}",
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 200
        events = resp.get_json()
        assert any(e["tipo_evento"] == "movimentacao" for e in events)

    def test_history_by_type_movimentacao(
        self, client, usuario_token, admin_token, computer, sector
    ):
        dest_resp = client.post(
            "/sectors", json={"nome": "Outro Setor"}, headers=auth_header(admin_token)
        )
        client.post(
            "/movements",
            json={
                "equipamento_id": computer["id"],
                "setor_destino_id": dest_resp.get_json()["id"],
            },
            headers=auth_header(usuario_token),
        )

        resp = client.get("/history/type/movimentacao", headers=auth_header(usuario_token))
        assert resp.status_code == 200
        events = resp.get_json()
        assert all(e["tipo_evento"] == "movimentacao" for e in events)

    def test_history_invalid_type_returns_400(self, client, usuario_token):
        resp = client.get("/history/type/tipo_invalido", headers=auth_header(usuario_token))
        assert resp.status_code == 400

    def test_get_history_event_by_id(
        self, client, usuario_token, admin_token, computer, sector
    ):
        dest_resp = client.post(
            "/sectors", json={"nome": "Setor X"}, headers=auth_header(admin_token)
        )
        client.post(
            "/movements",
            json={
                "equipamento_id": computer["id"],
                "setor_destino_id": dest_resp.get_json()["id"],
            },
            headers=auth_header(usuario_token),
        )

        # Get all history and fetch the first event by ID
        all_resp = client.get("/history", headers=auth_header(usuario_token))
        event_id = all_resp.get_json()[0]["id"]

        resp = client.get(f"/history/{event_id}", headers=auth_header(usuario_token))
        assert resp.status_code == 200
        assert resp.get_json()["id"] == event_id
