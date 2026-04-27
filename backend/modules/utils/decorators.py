from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from functools import wraps



def check_role(*perfis_permitidos):
    def wrapper(f):
        @wraps(f)
        def checker(*args, **kwargs):
            try:
                verify_jwt_in_request()
                jwt = get_jwt()

                perfil = jwt.get("perfil")

                if perfil not in perfis_permitidos:
                    return jsonify({"erro": "Acesso negado"}), 403

                return f(*args, **kwargs)

            except Exception:
                return jsonify({"erro": "Token inválido ou expirado"}), 401

        return checker
    return wrapper


def user_or_admin_user(param_name="url_id"):
    def wrapper(f):
        @wraps(f)
        def checker(*args, **kwargs):
            try:
                verify_jwt_in_request()

                jwt = get_jwt()
                user_id = get_jwt_identity()
                perfil = jwt.get("perfil")

                id_url = kwargs.get(param_name)

                if id_url is None:
                    return jsonify({"erro": "ID não informado"}), 400

                if perfil != "admin" and str(user_id) != str(id_url):
                    return jsonify({"erro": "Acesso negado"}), 403

                return f(*args, **kwargs)

            except Exception:
                return jsonify({"erro": "Token inválido ou expirado"}), 401

        return checker
    return wrapper