"""Tests: Maintenance OS flow + equipment status changes via database triggers"""
from tests.conftest import auth_header


class TestMaintenanceFlow:
    def test_create_maintenance_changes_equipment_status(
        self, client, usuario_token, computer
    ):
        """
        Opening a maintenance OS must change equipment status to 'em_manutencao'
        (triggered by trg_manutencao_aberta in the database).
        """
        resp = client.post(
            "/maintenances",
            json={
                "equipamento_id": computer["id"],
                "descricao": "Troca de memória RAM",
                "data_entrada": "2026-04-28 10:00:00",
            },
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 201

        # Equipment must now be 'em_manutencao'
        eq_resp = client.get(
            f"/computers/{computer['id']}",
            headers=auth_header(usuario_token),
        )
        data = eq_resp.get_json()
        assert "status" in data, f"Status missing in eq_resp: {data}"
        assert data["status"] == "em_manutencao"

    def test_cancel_maintenance_restores_equipment_status(
        self, client, usuario_token, gerente_token, computer
    ):
        """
        Cancelling an OS (DELETE) must restore equipment status to 'ativo'
        (triggered by trg_manutencao_encerrada).
        """
        # Open OS
        create_resp = client.post(
            "/maintenances",
            json={
                "equipamento_id": computer["id"],
                "descricao": "Problema na fonte",
                "data_entrada": "2026-04-28 10:00:00",
            },
            headers=auth_header(usuario_token),
        )
        os_id = create_resp.get_json().get("id") or _get_maintenance_id(
            client, usuario_token, computer["id"]
        )

        # Cancel OS (DELETE = change_status to 'cancelada')
        resp = client.delete(
            f"/maintenances/{os_id}",
            headers=auth_header(gerente_token),
        )
        assert resp.status_code == 200

        # Equipment must be 'ativo' again
        eq_resp = client.get(
            f"/computers/{computer['id']}",
            headers=auth_header(usuario_token),
        )
        assert eq_resp.get_json()["status"] == "ativo"

    def test_finalize_maintenance_restores_equipment_status(
        self, client, usuario_token, gerente_token, computer
    ):
        """Finalizing an OS must also restore equipment status to 'ativo'."""
        # Open OS
        client.post(
            "/maintenances",
            json={
                "equipamento_id": computer["id"],
                "descricao": "Limpeza geral",
                "data_entrada": "2026-04-28 10:00:00",
            },
            headers=auth_header(usuario_token),
        )
        os_id = _get_maintenance_id(client, usuario_token, computer["id"])

        # Finalize OS
        resp = client.put(
            f"/maintenances/{os_id}",
            json={"status": "finalizada", "data_saida": "2026-04-28 15:00:00"},
            headers=auth_header(gerente_token),
        )
        assert resp.status_code == 200

        # Equipment must be 'ativo' again
        eq_resp = client.get(
            f"/computers/{computer['id']}",
            headers=auth_header(usuario_token),
        )
        assert eq_resp.get_json()["status"] == "ativo"

    def test_get_maintenance_by_id(self, client, usuario_token, computer):
        client.post(
            "/maintenances",
            json={
                "equipamento_id": computer["id"],
                "descricao": "Verificação geral",
                "data_entrada": "2026-04-28 10:00:00",
            },
            headers=auth_header(usuario_token),
        )
        os_id = _get_maintenance_id(client, usuario_token, computer["id"])
        resp = client.get(f"/maintenances/{os_id}", headers=auth_header(usuario_token))
        assert resp.status_code == 200

    def test_get_nonexistent_maintenance_returns_404(self, client, usuario_token):
        resp = client.get("/maintenances/999999", headers=auth_header(usuario_token))
        assert resp.status_code == 404

    def test_usuario_cannot_delete_maintenance(self, client, usuario_token, computer):
        client.post(
            "/maintenances",
            json={
                "equipamento_id": computer["id"],
                "descricao": "Falha no HD",
                "data_entrada": "2026-04-28 10:00:00",
            },
            headers=auth_header(usuario_token),
        )
        os_id = _get_maintenance_id(client, usuario_token, computer["id"])
        resp = client.delete(
            f"/maintenances/{os_id}",
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 403


def _get_maintenance_id(client, token, equipment_id):
    """Helper: fetch the first maintenance ID for a given equipment."""
    resp = client.get("/maintenances", headers=auth_header(token))
    maintenances = resp.get_json()
    for m in maintenances:
        if m["equipamento_id"] == equipment_id:
            return m["id"]
    raise ValueError(f"No maintenance found for equipment {equipment_id}")
