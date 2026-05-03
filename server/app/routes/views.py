"""
Rutas de vistas del API.
Maneja el registro de visualizaciones de videos.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.view import View
from ..models.video import Video
from flask import request, jsonify
from datetime import datetime


@bp.route('/videos/<int:video_id>/views', methods=['GET'])
def get_video_views(video_id):
    """
    Obtiene todas las vistas de un video.
    
    PARAMS:
        - video_id: ID del video
        
    Returns:
        200: Lista de vistas del video
        404: Video not found
        500: Internal error
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        views = View.query.filter_by(id_video=video_id).all()

        return jsonify({
            'message': 'Views retrieved',
            'vistas': [v.to_dict() for v in views]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/views', methods=['POST'])
@token_required
def create_view(current_user, video_id):
    """
    Registra una vista de un video por el usuario actual.
    
    Si el usuario ya vio el video, actualiza la fecha.
    Incrementa el contador de vistas del video.
    
    PARAMS:
        - video_id: ID del video
        
    Returns:
        200: View updated
        201: Vista registrada
        404: Video not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        # Verifica si el usuario ya vio el video
        existing_view = View.query.filter_by(
            id_video=video_id,
            id_user=current_user.id
        ).first()

        if existing_view:
            # Actualiza la fecha de visualización
            existing_view.viewed_at = datetime.utcnow()
            # Incrementa el contador de vistas del video incluso si ya lo vio
            video.views_count += 1
            db.session.commit()
            return jsonify({
                'message': 'View updated',
                'vista': existing_view.to_dict()
            }), 200

        # Crea nueva vista
        view = View(
            id_video=video_id,
            id_user=current_user.id
        )

        # Incrementa el contador de vistas del video
        video.views_count += 1

        db.session.add(view)
        db.session.commit()

        return jsonify({
            'message': 'Vista registrada',
            'vista': view.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/views', methods=['DELETE'])
@token_required
def delete_view(current_user, video_id):
    """
    Elimina una vista del usuario actual en un video.
    
    Decrementa el contador de vistas del video.
    
    PARAMS:
        - video_id: ID del video
        
    Returns:
        200: View removed
        404: View not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        view = View.query.filter_by(
            id_video=video_id,
            id_user=current_user.id
        ).first()

        if not view:
            return jsonify({'message': 'View not found'}), 404

        # Decrementa el contador
        video = Video.query.get(video_id)
        if video and video.views_count > 0:
            video.views_count -= 1

        db.session.delete(view)
        db.session.commit()

        return jsonify({'message': 'View removed'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500