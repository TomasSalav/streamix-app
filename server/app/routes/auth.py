"""
Rutas de autenticación del API.
Maneja el registro, inicio de sesión y cierre de sesión de usuarios.

Autor: Streamix
"""
from . import bp
from ..models.user import User
from ..extensions import db
from flask import request, jsonify
import jwt
import datetime
import os
from functools import wraps

# Clave secreta para firmar los tokens JWT
# Se obtiene de variables de entorno o usa una por defecto
SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')


def generate_token(user_id: int) -> str:
    """
    Genera un token JWT para un usuario.
    
    Args:
        user_id: ID del usuario para el cual generar el token
        
    Returns:
        Token JWT codificado como string
    """
    # Payload contiene los datos del token
    # exp: fecha de expiración (24 horas desde creación)
    # iat: fecha de emisión (creación)
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def token_required(f):
    """
    Decorador para proteger rutas que requieren autenticación.
    
    Verifica que el token JWT sea válido y no haya expirado.
    Si es válido, pasa el usuario actual como primer argumento.
    
    Usage:
        @token_required
        def ruta_protegida(current_user):
            ...
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = None
        # Extrae el token del header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Formato: "Bearer <token>"
            except IndexError:
                return jsonify({'message': 'Token inválido'}), 401

        if not token:
            return jsonify({'message': 'Token no proporcionado'}), 401

        try:
            # Decodifica y verifica el token
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Usuario no encontrado'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        # Pasa el usuario actual a la función decorada
        return f(current_user, *args, **kwargs)

    return wrapper


# =============================================================================
# Rutas de autenticación
# =============================================================================

@bp.route('/auth/signup', methods=['POST'])
def signup():
    """
    Registro de nuevo usuario.
    
   BODY (JSON):
        - username: nombre de usuario (requerido)
        - email: correo electrónico (requerido)
        - password: contraseña (requerido)
        - avatar_url: URL del avatar (opcional)
        - bio: biografía del usuario (opcional)
        
    Returns:
        201: User created con token JWT
        400: Missing required data o email/username ya en uso
    """
    try:
        data = request.get_json()

        # Validación de datos requeridos
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Faltan campos requeridos'}), 400

        # Verifica si el email ya existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Correo electrónico ya registrado'}), 400

        # Verifica si el username ya existe
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Nombre de usuario ya en uso'}), 400

        # Crea el nuevo usuario
        user = User(
            username=data['username'],
            email=data['email'],
            avatar_url=data.get('avatar_url'),
            bio=data.get('bio')
        )
        # Hashea la contraseña antes de guardarla
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        # Genera token para el nuevo usuario
        token = generate_token(user.id)

        return jsonify({
            'message': 'Usuario creado exitosamente',
            'token': token,
            'usuario': user.to_dict()
        }), 201

    except ValueError as e:
        return jsonify({'message': f'Validation error: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Internal error: {str(e)}'}), 500


@bp.route('/auth/login', methods=['POST'])
def login():
    """
    Inicio de sesión de usuario.
    
    BODY (JSON):
        - email: correo electrónico (requerido)
        - password: contraseña (requerido)
        
    Returns:
        200: Inicio de sesión exitoso con token JWT
        400: Missing required data
        401: Invalid email or password
    """
    try:
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Datos incompletos. Se requiere correo electrónico y contraseña'}), 400

        # Busca usuario por email o username
        user = User.query.filter(
            (User.email == data['email']) | (User.username == data['email'])
        ).first()

        # Verifica credenciales
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Correo electrónico o contraseña incorrectos'}), 401

        # Genera token para el usuario
        token = generate_token(user.id)

        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'token': token,
            'usuario': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'message': f'Internal error: {str(e)}'}), 500


@bp.route('/auth/logout', methods=['POST'])
@token_required
def logout(current_user):
    """
    Cierra la sesión del usuario actual.
    
    Returns:
        200: Cierre de sesión exitoso
        
    Requiere: Token JWT en header Authorization
    """
    return jsonify({'message': 'Cierre de sesion exitoso'}), 200


@bp.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Obtiene la información del usuario actualmente autenticado.
    
    Returns:
        200: Datos del usuario actual
        
    Requiere: Token JWT en header Authorization
    """
    return jsonify({
        'message': 'Usuario actual obtenido',
        'usuario': current_user.to_dict()
    }), 200
