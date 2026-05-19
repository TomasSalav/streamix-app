"""
Rutas de videos del API.
Maneja el CRUD completo de videos.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.video import Video
from ..models.user import User
from flask import request, jsonify, current_app
import os
import time
import uuid
from werkzeug.utils import secure_filename


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


ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mkv', 'webm', 'avi'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

@bp.route('/videos', methods=['POST'])
@token_required
def create_video(current_user):
    """
    Sube un nuevo video (multipart/form-data).
    """
    try:
        # Extraemos los datos del formulario (request.form)
        title = request.form.get('title')
        description = request.form.get('description', '')
        
        # Validaciones básicas de presencia de archivos y campos
        if not title:
            return jsonify({'message': 'Missing required data. Se requiere title'}), 400
            
        if 'video' not in request.files or 'thumbnail' not in request.files:
            return jsonify({'message': 'Se requieren archivos de video y miniatura'}), 400
            
        video_file = request.files['video']
        thumbnail_file = request.files['thumbnail']
        
        if video_file.filename == '' or thumbnail_file.filename == '':
            return jsonify({'message': 'Archivos no seleccionados'}), 400
            
        # Verificamos que las extensiones sean permitidas
        if not allowed_file(video_file.filename, ALLOWED_VIDEO_EXTENSIONS):
            return jsonify({'message': 'Formato de video no permitido'}), 400
            
        if not allowed_file(thumbnail_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({'message': 'Formato de miniatura no permitido'}), 400

        # Preparamos la carpeta de destino: server/public/videos/<user_id>/
        public_dir = current_app.static_folder
        user_dir = os.path.join(public_dir, 'videos', str(current_user.id))
        os.makedirs(user_dir, exist_ok=True)
        
        # Generamos nombres únicos con timestamp para evitar sobreescritura
        timestamp = int(time.time())
        video_filename = f"{timestamp}_video_{secure_filename(video_file.filename)}"
        thumb_filename = f"{timestamp}_thumb_{secure_filename(thumbnail_file.filename)}"
        
        video_path = os.path.join(user_dir, video_filename)
        thumb_path = os.path.join(user_dir, thumb_filename)
        
        # Guardamos físicamente los archivos en el servidor
        video_file.save(video_path)
        thumbnail_file.save(thumb_path)
        
        # Construimos las URLs públicas para acceder a los archivos
        base_url = request.host_url.rstrip('/')
        video_url = f"{base_url}/public/videos/{current_user.id}/{video_filename}"
        thumbnail_url = f"{base_url}/public/videos/{current_user.id}/{thumb_filename}"

        # Creamos el registro en la base de datos vinculado al usuario actual
        video = Video(
            title=title,
            description=description,
            url=video_url,
            thumbnail_url=thumbnail_url,
            duration=0,
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
