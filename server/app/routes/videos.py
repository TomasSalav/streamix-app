"""
Rutas de videos del API.
Maneja el CRUD completo de videos.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.video import Video
from ..models.user import User
from flask import request, jsonify


@bp.route('/videos', methods=['GET'])
def get_videos():
    """
    Obtiene todos los videos con paginación.
    
    QUERY PARAMS:
        - page: número de página (default: 1)
        - per_page: videos por página (default: 10)
        - user_id: filtrar por usuario (opcional)
        
    Returns:
        200: Lista de videos con metadatos de paginación
        500: Internal error
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        user_id = request.args.get('user_id', type=int)
        
        query = Video.query
        if user_id:
            query = query.filter_by(id_user=user_id)
        
        videos = query.order_by(Video.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'message': 'Videos retrieved',
            'videos': [v.to_dict() for v in videos.items],
            'total': videos.total,
            'pagina_actual': videos.page,
            'total_paginas': videos.pages
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>', methods=['GET'])
def get_video(video_id):
    """
    Obtiene un video por su ID.
    
    PARAMS:
        - video_id: ID del video a buscar
        
    Returns:
        200: Datos del video
        404: Video not found
        500: Internal error
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        return jsonify({
            'message': 'Video retrieved',
            'video': video.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos', methods=['POST'])
@token_required
def create_video(current_user):
    """
    Sube un nuevo video.
    
    BODY (JSON):
        - title: título del video (requerido)
        - url: URL del video (requerido)
        - description: descripción (opcional)
        - thumbnail_url: URL de miniatura (opcional)
        - duration: duración en segundos (opcional)
        
    Returns:
        201: Video created
        400: Missing required data
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        data = request.get_json()

        if not data or not data.get('title') or not data.get('url'):
            return jsonify({'message': 'Missing required data. Se requiere title y url'}), 400

        video = Video(
            title=data['title'],
            description=data.get('description'),
            url=data['url'],
            thumbnail_url=data.get('thumbnail_url'),
            duration=data.get('duration'),
            id_user=current_user.id
        )

        db.session.add(video)
        db.session.commit()

        return jsonify({
            'message': 'Video created',
            'video': video.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>', methods=['PUT'])
@token_required
def update_video(current_user, video_id):
    """
    Actualiza un video.
    Solo el propietario puede actualizar.
    
    PARAMS:
        - video_id: ID del video a actualizar
        
    BODY (JSON):
        - title, description, url, thumbnail_url, duration (opcionales)
        
    Returns:
        200: Video updated
        403: Not authorized
        404: Video not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        if video.id_user != current_user.id:
            return jsonify({'message': 'Not authorized to update this video'}), 403

        data = request.get_json()

        if data.get('title'):
            video.title = data['title']
        if data.get('description'):
            video.description = data['description']
        if data.get('url'):
            video.url = data['url']
        if data.get('thumbnail_url'):
            video.thumbnail_url = data['thumbnail_url']
        if data.get('duration'):
            video.duration = data['duration']

        db.session.commit()

        return jsonify({
            'message': 'Video updated',
            'video': video.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>', methods=['DELETE'])
@token_required
def delete_video(current_user, video_id):
    """
    Elimina un video.
    Solo el propietario puede eliminar.
    
    PARAMS:
        - video_id: ID del video a eliminar
        
    Returns:
        200: Video deleted
        403: Not authorized
        404: Video not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        if video.id_user != current_user.id:
            return jsonify({'message': 'Not authorized to delete this video'}), 403

        db.session.delete(video)
        db.session.commit()

        return jsonify({'message': 'Video deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/<int:user_id>/videos', methods=['GET'])
def get_user_videos(user_id):
    """
    Obtiene todos los videos de un usuario.
    
    PARAMS:
        - user_id: ID del usuario
        
    Returns:
        200: Lista de videos del usuario
        404: User not found
        500: Internal error
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        videos = Video.query.filter_by(id_user=user_id).order_by(Video.created_at.desc()).all()

        return jsonify({
            'message': 'User videos retrieved',
            'videos': [v.to_dict() for v in videos]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500