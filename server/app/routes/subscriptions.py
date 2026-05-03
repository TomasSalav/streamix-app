"""
Rutas de suscripciones del API.
Maneja las suscripciones entre usuarios.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.subscription import Subscription
from ..models.user import User
from flask import request, jsonify


@bp.route('/subscriptions', methods=['GET'])
@token_required
def get_subscriptions(current_user):
    """
    Obtiene las suscripciones del usuario actual.
    
    Returns:
        200: Lista de suscripciones del usuario
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        subscriptions = Subscription.query.filter_by(id_subscriber=current_user.id).all()

        return jsonify({
            'message': 'Subscriptions retrieved',
            'suscripciones': [s.to_dict() for s in subscriptions]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>/subscribers', methods=['GET'])
def get_subscribers(user_id):
    """
    Obtiene los suscriptores de un usuario.
    
    PARAMS:
        - user_id: ID del usuario
        
    Returns:
        200: Lista de suscriptores
        404: User not found
        500: Internal error
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        subscriptions = Subscription.query.filter_by(id_subscribed=user_id).all()

        return jsonify({
            'message': 'Subscribers retrieved',
            'suscriptores': [s.to_dict() for s in subscriptions]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>/subscribe', methods=['POST'])
@token_required
def subscribe(current_user, user_id):
    """
    Se suscribe o desuscribe de un usuario (toggle).
    
    Si ya está suscrito, se desuscribe.
    Si no está suscrito, crea la suscripción.
    
    PARAMS:
        - user_id: ID del usuario a suscribirse
        
    Returns:
        200: Suscripción eliminada
        201: Suscripción creada
        400: Cannot subscribe to yourself
        404: User not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        if current_user.id == user_id:
            return jsonify({'message': 'Cannot subscribe to yourself'}), 400

        existing = Subscription.query.filter_by(
            id_subscriber=current_user.id,
            id_subscribed=user_id
        ).first()

        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'message': 'Subscription removed'}), 200

        subscription = Subscription(
            id_subscriber=current_user.id,
            id_subscribed=user_id
        )

        db.session.add(subscription)
        db.session.commit()

        return jsonify({
            'message': 'Subscription created',
            'suscripcion': subscription.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>/unsubscribe', methods=['POST'])
@token_required
def unsubscribe(current_user, user_id):
    """
    Cancela la suscripción a un usuario.
    
    PARAMS:
        - user_id: ID del usuario
        
    Returns:
        200: Suscripción eliminada
        404: Suscripción no encontrada
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        subscription = Subscription.query.filter_by(
            id_subscriber=current_user.id,
            id_subscribed=user_id
        ).first()

        if not subscription:
            return jsonify({'message': 'Subscription not found'}), 404

        db.session.delete(subscription)
        db.session.commit()

        return jsonify({'message': 'Subscription removed'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>/is_subscribed', methods=['GET'])
@token_required
def check_subscription(current_user, user_id):
    """
    Verifica si el usuario actual está suscrito a otro usuario.
    
    PARAMS:
        - user_id: ID del usuario a verificar
        
    Returns:
        200: Estado de suscripción
        
    Requiere: Token JWT
    """
    try:
        subscription = Subscription.query.filter_by(
            id_subscriber=current_user.id,
            id_subscribed=user_id
        ).first()

        return jsonify({
            'message': 'Subscription status',
            'suscrito': subscription is not None
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500