from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity, verify_jwt_in_request
from functools import wraps
from modules.colaboradores.colaboradores import Colaborador

colaboradores_bp = Blueprint('user_bp', __name__, url_prefix='/user')
colaboradores_obj = Colaborador()


def check_role_user(*cargos):
    def wrapper(f):
        @wraps(f)
        def checker_role_user(*args, **kwargs):
            verify_jwt_in_request()
            jwt = get_jwt()
            if jwt.get("role") not in cargos:
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker_role_user
    return wrapper