from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from functools import wraps


def check_role(cargo):
    def wrapper(f):
        @wraps(f)
        def checker(*args, **kwargs):
            verify_jwt_in_request()
            jwt = get_jwt()
            if jwt.get("perfil") != cargo:
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker
    return wrapper


def user_or_admin():
    def wrapper(f):
        @wraps(f)
        def checker(*args, **kwargs):
            verify_jwt_in_request()
            id_url = kwargs.get("url_id")
            jwt = get_jwt()
            user_id = get_jwt_identity()
            if jwt.get("perfil") != "admin" and str(user_id) != str(id_url):
                return jsonify({"status": "Acesso negado"}), 403
            return f(*args, **kwargs)
        return checker
    return wrapper