from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_jwt_extended import jwt_required
from modules.utils.decorators import check_role
from modules.collaborator.collaborator import Collaborator

collaborator_bp = Blueprint("collaborator", __name__, url_prefix="/collaborator")


# CREATE
@collaborator_bp.route("/post", methods=["POST"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/collaborator/create_collaborator.yml")
def create_collaborator():
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    collaborator_model = Collaborator()

    try:
        collaborator_model.create(dados)
        return jsonify({"status": "sucesso"}), 201

    except Exception as e:
        return jsonify({"erro": str(e)}), 400


# READ ALL
@collaborator_bp.route("/get", methods=["GET"])
@jwt_required()
@swag_from("../../docs/collaborator/list_collaborator.yml")
def list_collaborator():
    collaborator_model = Collaborator()
    return jsonify(collaborator_model.get_all()), 200


# READ BY ID
@collaborator_bp.route("/get/<int:url_id>", methods=["GET"])
@jwt_required()
@swag_from("../../docs/collaborator/get_collaborator.yml")
def get_collaborator(url_id):
    collaborator_model = Collaborator()
    collaborator = collaborator_model.get_by_id(url_id)

    if not collaborator:
        return jsonify({"erro": "Colaborador não encontrado"}), 404

    return jsonify(collaborator), 200


# UPDATE
@collaborator_bp.route("/put/<int:url_id>", methods=["PUT"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/collaborator/update_collaborator.yml")
def update_collaborator(url_id):
    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "JSON inválido"}), 400

    collaborator_model = Collaborator()
    collaborator_model.update(url_id, dados)

    return jsonify({"status": "sucesso"}), 200


# DELETE
@collaborator_bp.route("/delete/<int:url_id>", methods=["DELETE"])
@jwt_required()
@check_role("admin", "gerente")
@swag_from("../../docs/collaborator/delete_collaborator.yml")
def delete_collaborator(url_id):
    collaborator_model = Collaborator()
    collaborator_model.soft_delete(url_id)

    return jsonify({"status": "colaborador desativado"}), 200