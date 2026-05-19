"""
Rutas de reacciones (likes/dislikes) del API.
Maneja las reacciones en videos.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.reaction import Reaction
from ..models.video import Video
from flask import request, jsonify


@bp.route('/videos/<int:video_id>/reactions', methods=['GET'])
def get_video_reactions(video_id):
    """
    Obtiene todas las reacciones de un video.
    
    PARAMS:
        - video_id: ID del video
        
    Returns:
        200: Lista de reacciones del video
        404: Video not found
        500: Internal error
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        reactions = Reaction.query.filter_by(id_video=video_id).all()

        return jsonify({
            'message': 'Reactions retrieved',
            'reacciones': [r.to_dict() for r in reactions]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/reactions', methods=['POST'])
@token_required
def create_reaction(current_user, video_id):
    """
    Crea o actualiza una reacción en un video.
    
    El comportamiento es toggler: sienvía la misma reacción,
    se elimina. Si envía otra, la intercambia.
    
    PARAMS:
        - video_id: ID del video
        
    BODY (JSON):
        - reaction_type: "like" o "dislike" (requerido)
        
    Returns:
        200: Reacción actualizada/eliminada
        201: Reacción creada
        400: Tipo de reacción inválido
        404: Video not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        data = request.get_json()
        reaction_type = data.get('reaction_type', '').lower()

        if reaction_type not in ['like', 'dislike']:
            return jsonify({'message': 'Tipo de reaccion invalido. Usa "like" o "dislike"'}), 400

        # Verifica si ya existe reacción del usuario
        existing = Reaction.query.filter_by(id_user=current_user.id, id_video=video_id).first()

        if existing:
            # Si es la misma reacción, la elimina (toggle)
            if existing.reaction_type == reaction_type:
                db.session.delete(existing)
                db.session.commit()

                if reaction_type == 'like':
                    video.likes_count = max(0, video.likes_count - 1)
                else:
                    video.dislikes_count = max(0, video.dislikes_count - 1)

                db.session.commit()
                return jsonify({'message': 'Reaction removed'}), 200

            # Cambia el tipo de reacción
            existing.reaction_type = reaction_type

            # Actualiza los contadores
            if reaction_type == 'like':
                video.likes_count += 1
                video.dislikes_count = max(0, video.dislikes_count - 1)
            else:
                video.dislikes_count += 1
                video.likes_count = max(0, video.likes_count - 1)

            db.session.commit()

            return jsonify({
                'message': 'Reaction updated',
                'reaccion': existing.to_dict()
            }), 200

        # Crea nueva reacción
        reaction = Reaction(
            reaction_type=reaction_type,
            id_user=current_user.id,
            id_video=video_id
        )

        if reaction_type == 'like':
            video.likes_count += 1
        else:
            video.dislikes_count += 1

        db.session.add(reaction)
        db.session.commit()

        return jsonify({
            'message': 'Reaction created',
            'reaccion': reaction.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/reactions/<int:user_id>', methods=['GET'])
@token_required
def get_user_reaction(current_user, video_id, user_id):
    """
    Obtiene la reacción de un usuario específico en un video.
    
    PARAMS:
        - video_id: ID del video
        - user_id: ID del usuario
        
    Returns:
        200: Reacción del usuario
        403: Not authorized
        404: Reacción no encontrada
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        if current_user.id != user_id:
            return jsonify({'message': 'Not authorized'}), 403

        reaction = Reaction.query.filter_by(id_user=user_id, id_video=video_id).first()

        if not reaction:
            return jsonify({'message': 'Reaction not found', 'reaccion': None}), 404

        return jsonify({
            'message': 'Reaction retrieved',
            'reaccion': reaction.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
