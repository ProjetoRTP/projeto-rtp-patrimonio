"""Tests: Sectors and Subsectors CRUD + subsector integrity validation"""
import pytest
from tests.conftest import auth_header


class TestSectorCRUD:
    def test_create_sector(self, client, admin_token):
        resp = client.post(
            "/sectors",
            json={"nome": "TI", "descricao": "Tecnologia"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 201

    def test_list_sectors(self, client, usuario_token, sector):
        resp = client.get("/sectors", headers=auth_header(usuario_token))
        assert resp.status_code == 200
        data = resp.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_sector_by_id(self, client, usuario_token, sector):
        sector_id = sector["id"]
        resp = client.get(f"/sectors/{sector_id}", headers=auth_header(usuario_token))
        assert resp.status_code == 200
        assert resp.get_json()["nome"] == "TI"

    def test_get_nonexistent_sector_returns_404(self, client, usuario_token):
        resp = client.get("/sectors/999999", headers=auth_header(usuario_token))
        assert resp.status_code == 404

    def test_update_sector(self, client, admin_token, sector):
        resp = client.put(
            f"/sectors/{sector['id']}",
            json={"nome": "TI Atualizado"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200

    def test_delete_sector_soft_deletes(self, client, admin_token, sector):
        sector_id = sector["id"]

        # Delete (soft)
        resp = client.delete(
            f"/sectors/{sector_id}",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200

        # Should no longer appear in GET by ID
        resp = client.get(f"/sectors/{sector_id}", headers=auth_header(admin_token))
        assert resp.status_code == 404

    def test_create_sector_missing_name_returns_400(self, client, admin_token):
        resp = client.post(
            "/sectors",
            json={"descricao": "Sem nome"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 400


class TestSubsectorCRUD:
    def test_create_subsector(self, client, admin_token, sector):
        resp = client.post(
            "/subsectors",
            json={"nome": "Suporte", "setor_id": sector["id"]},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 201

    def test_list_subsectors_by_sector(self, client, usuario_token, subsector):
        setor_id = subsector["setor_id"]
        resp = client.get(
            f"/subsectors/sector/{setor_id}",
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert any(s["nome"] == "Infraestrutura" for s in data)

    def test_get_subsector_by_id(self, client, usuario_token, subsector):
        resp = client.get(
            f"/subsectors/{subsector['id']}",
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 200

    def test_delete_subsector(self, client, admin_token, subsector):
        resp = client.delete(
            f"/subsectors/{subsector['id']}",
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 200

    def test_create_subsector_missing_sector_id_returns_400(self, client, admin_token):
        resp = client.post(
            "/subsectors",
            json={"nome": "Sem setor"},
            headers=auth_header(admin_token),
        )
        assert resp.status_code == 400


class TestSubsectorIntegrity:
    """
    Validates that a computer cannot be assigned to a subsector
    from a different sector (two-layer: Python + SQL trigger).
    """

    def test_computer_with_valid_subsector(self, client, usuario_token, sector, subsector):
        resp = client.post(
            "/computers",
            json={
                "num_patrimonio": "PC-VALID-SUB",
                "os": "Linux", "mem_cpu": "i5", "mem_ram": "8GB",
                "armazenamento": "256GB",
                "setor_id": sector["id"],
                "subsetor_id": subsector["id"],
            },
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 201

    def test_computer_with_wrong_subsector_returns_400(self, client, admin_token, usuario_token):
        """Subsector belongs to sector A, equipment assigned to sector B."""
        # Create two sectors
        r1 = client.post(
            "/sectors", json={"nome": "Setor A"}, headers=auth_header(admin_token)
        )
        r2 = client.post(
            "/sectors", json={"nome": "Setor B"}, headers=auth_header(admin_token)
        )
        sector_a_id = r1.get_json()["id"]
        sector_b_id = r2.get_json()["id"]

        # Create subsector inside sector A
        r3 = client.post(
            "/subsectors",
            json={"nome": "Sub A", "setor_id": sector_a_id},
            headers=auth_header(admin_token),
        )
        subsector_a_id = r3.get_json()["id"]

        # Try to assign equipment to sector B but subsector from sector A → must fail
        resp = client.post(
            "/computers",
            json={
                "num_patrimonio": "PC-WRONG-SUB",
                "os": "Linux", "mem_cpu": "i5", "mem_ram": "8GB",
                "armazenamento": "256GB",
                "setor_id": sector_b_id,
                "subsetor_id": subsector_a_id,
            },
            headers=auth_header(usuario_token),
        )
        assert resp.status_code == 400
