"""
Rutas de usuarios del API.
Maneja el CRUD completo de usuarios.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.user import User
from flask import request, jsonify


@bp.route('/users', methods=['GET'])
def get_users():
    """
    Obtiene todos los usuarios registrados.
    
    Returns:
        200: Lista de todos los usuarios
        500: Internal error del servidor
    """
    try:
        users = User.query.all()
        return jsonify({
            'message': 'Users retrieved',
            'usuarios': [u.to_dict() for u in users]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Obtiene un usuario por su ID.
    
    PARAMS:
        - user_id: ID del usuario a buscar
        
    Returns:
        200: Datos del usuario
        404: User not found
        500: Internal error
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({
            'message': 'User retrieved',
            'usuario': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users', methods=['POST'])
def create_user():
    """
    Crea un nuevo usuario (alternativa a signup).
    
    BODY (JSON):
        - username: nombre de usuario (requerido)
        - email: correo electrónico (requerido)
        - password: contraseña (requerido)
        - avatar_url: URL del avatar (opcional)
        - bio: biografía (opcional)
        
    Returns:
        201: User created exitosamente
        400: Missing required data o email/username en uso
        500: Internal error
    """
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing required data'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400

        user = User(
            username=data['username'],
            email=data['email'],
            avatar_url=data.get('avatar_url'),
            bio=data.get('bio')
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'message': 'User created',
            'usuario': user.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    """
    Actualiza la información de un usuario.
    Solo el propio usuario puede actualizarse.
    
    PARAMS:
        - user_id: ID del usuario a actualizar
        
    BODY (JSON):
        - username: nuevo username (opcional)
        - email: nuevo email (opcional)
        - password: nueva contraseña (opcional)
        - avatar_url: nuevo avatar (opcional)
        - bio: nueva biografía (opcional)
        
    Returns:
        200: User updated
        403: Not authorized
        404: User not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        # Verifica que el usuario actual sea el mismo que se quiere actualizar
        if current_user.id != user_id:
            return jsonify({'message': 'Not authorized to update this user'}), 403

        data = request.get_json()

        if data.get('username'):
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return jsonify({'message': 'Username already in use'}), 400
            current_user.username = data['username']

        if data.get('email'):
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'message': 'Email already in use'}), 400
            current_user.email = data['email']

        if data.get('bio'):
            current_user.bio = data['bio']

        if data.get('avatar_url'):
            current_user.avatar_url = data['avatar_url']

        if data.get('password'):
            current_user.set_password(data['password'])

        db.session.commit()

        return jsonify({
            'message': 'User updated',
            'usuario': current_user.to_dict()
        }), 200
    except ValueError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    """
    Elimina un usuario.
    Solo el propio usuario puede eliminarse.
    
    PARAMS:
        - user_id: ID del usuario a eliminar
        
    Returns:
        200: User deleted
        403: Not authorized
        404: User not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        if current_user.id != user_id:
            return jsonify({'message': 'Not authorized to delete this user'}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': 'User deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500