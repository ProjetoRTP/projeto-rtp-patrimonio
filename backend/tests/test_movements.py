"""Tests: Movement registration + auto-fill of setor_origem + history creation"""
from tests.conftest import auth_header


def _create_second_sector(client, admin_token):
    resp = client.post(
        "/sectors",
        json={"nome": "Financeiro"},
        headers=auth_header(admin_token),
    )
    assert resp.status_code == 201
    return resp.get_json()["id"]


class TestMovements:
    def test_create_movement_returns_201(self, client, usuario_token, admin_token, computer, sector):
        dest_id = _create_second_sector(client, admin_token)
        resp = client.post(
            "/movements",
            json={
                "equipamento_id": computer["id"],
                "setor_destino_id": dest_id,
            },
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 201
        assert "id" in resp.get_json()

    def test_movement_updates_equipment_sector(self, client, usuario_token, admin_token, computer, sector):
        """After a movement, the equipment's setor_id must reflect the destination."""
        dest_id = _create_second_sector(client, admin_token)

        client.post(
            "/movements",
            json={"equipamento_id": computer["id"], "setor_destino_id": dest_id},
            headers=auth_header(usuario_token),
        )

        # Verify equipment was updated (GET /computers/<id>)
        resp = client.get(f"/computers/{computer['id']}", headers=auth_header(usuario_token))
        data = resp.get_json()
        assert data["setor_id"] == dest_id

    def test_movement_origin_auto_filled(self, client, usuario_token, admin_token, computer, sector):
        """setor_origem_id must be auto-populated from equipment's current sector."""
        dest_id = _create_second_sector(client, admin_token)
        origin_sector_id = sector["id"]

        movement_resp = client.post(
            "/movements",
            json={"equipamento_id": computer["id"], "setor_destino_id": dest_id},
            headers=auth_header(usuario_token),
        )
        movement_id = movement_resp.get_json()["id"]

        # Retrieve the movement and verify setor_origem was set automatically
        resp = client.get(f"/movements/{movement_id}", headers=auth_header(usuario_token))
        assert resp.status_code == 200
        assert resp.get_json()["setor_origem_id"] == origin_sector_id

    def test_movement_creates_history_event(self, client, usuario_token, admin_token, computer, sector):
        """A movement to a different sector must create a 'movimentacao' history entry."""
        dest_id = _create_second_sector(client, admin_token)

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
        event_types = [e["tipo_evento"] for e in events]
        assert "movimentacao" in event_types

    def test_get_movements_by_equipment(self, client, usuario_token, admin_token, computer):
        dest_id = _create_second_sector(client, admin_token)
        client.post(
            "/movements",
            json={"equipamento_id": computer["id"], "setor_destino_id": dest_id},
            headers=auth_header(usuario_token),
        )

        resp = client.get(
            f"/movements/equipment/{computer['id']}",
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 200
        assert len(resp.get_json()) >= 1

    def test_movement_missing_equipment_id_returns_400(self, client, usuario_token, sector):
        resp = client.post(
            "/movements",
            json={"setor_destino_id": sector["id"]},
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 400

    def test_movement_nonexistent_equipment_returns_400(self, client, usuario_token, sector):
        resp = client.post(
            "/movements",
            json={"equipamento_id": 999999, "setor_destino_id": sector["id"]},
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 400
