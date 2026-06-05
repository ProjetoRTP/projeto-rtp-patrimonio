import jwt
from flask import jsonify, request, g
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()
CHAVE_SECRETA =  os.getenv("JWT_SECRET_KEY", "fallback-inseguro")

def check_role(*perfis_permitidos):
    def wrapper(f):
        @wraps(f)
        def checker(*args, **kwargs):
            try:
                verify_jwt_in_request()
                jwt = get_jwt()
            except Exception:
                return jsonify({"erro": "Token inválido ou expirado"}), 401

            perfil = jwt.get("perfil")

            if perfil not in perfis_permitidos:
                return jsonify({"erro": "Acesso negado"}), 403

            return f(*args, **kwargs)

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
            except Exception:
                return jsonify({"erro": "Token inválido ou expirado"}), 401

            perfil = jwt.get("perfil")
            id_url = kwargs.get(param_name)

            if id_url is None:
                return jsonify({"erro": "ID não informado"}), 400

            if perfil != "admin" and str(user_id) != str(id_url):
                return jsonify({"erro": "Acesso negado"}), 403

            return f(*args, **kwargs)

        return checker
    return wrapper

def verificar_token(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"erro": "Token ausente"}), 401

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, CHAVE_SECRETA, algorithms=["HS256"])
            
            g.usuario_id = payload.get('id')
            
        except jwt.ExpiredSignatureError:
            return jsonify({"erro": "Token expirou"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"erro": "Token inválido"}), 401
            
        return f(*args, **kwargs)
        
    return decorador