"""
Rutas de comentarios del API.
Maneja los comentarios en videos.

"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.comment import Comment
from ..models.video import Video
from flask import request, jsonify


@bp.route('/comments', methods=['GET'])
def get_comments():
    """
    Obtiene todos los comentarios con paginación.
    
    QUERY PARAMS:
        - video_id: filtrar por video (opcional)
        - page: número de página (default: 1)
        - per_page: comentarios por página (default: 20)
        
    Returns:
        200: Lista de comentarios
        500: Internal error
    """
    try:
        video_id = request.args.get('video_id', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Comment.query
        if video_id:
            query = query.filter_by(id_video=video_id)
        
        comments = query.order_by(Comment.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'message': 'Comments retrieved',
            'comentarios': [c.to_dict() for c in comments.items],
            'total': comments.total,
            'pagina_actual': comments.page,
            'total_paginas': comments.pages
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/comments/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    """
    Obtiene un comentario por su ID.
    
    PARAMS:
        - comment_id: ID del comentario
        
    Returns:
        200: Datos del comentario
        404: Comment not found
        500: Internal error
    """
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'message': 'Comment not found'}), 404

        return jsonify({
            'message': 'Comment retrieved',
            'comentario': comment.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/comments', methods=['POST'])
@token_required
def create_comment(current_user, video_id):
    """
    Crea un comentario en un video.
    
    PARAMS:
        - video_id: ID del video donde comentar
        
    BODY (JSON):
        - content: texto del comentario (requerido)
        
    Returns:
        201: Comment created
        400: Content required
        404: Video not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        data = request.get_json()
        if not data or not data.get('content'):
            return jsonify({'message': 'Content required'}), 400

        comment = Comment(
            content=data['content'],
            id_user=current_user.id,
            id_video=video_id
        )

        db.session.add(comment)
        db.session.commit()

        return jsonify({
            'message': 'Comment created',
            'comentario': comment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/comments/<int:comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, comment_id):
    """
    Actualiza un comentario.
    Solo el propietario puede actualizar.
    
    PARAMS:
        - comment_id: ID del comentario
        
    BODY (JSON):
        - content: nuevo contenido
        
    Returns:
        200: Comment updated
        403: Not authorized
        404: Comment not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'message': 'Comment not found'}), 404

        if comment.id_user != current_user.id:
            return jsonify({'message': 'Not authorized to update this comment'}), 403

        data = request.get_json()
        if data.get('content'):
            comment.content = data['content']

        db.session.commit()

        return jsonify({
            'message': 'Comment updated',
            'comentario': comment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    """
    Elimina un comentario.
    Solo el propietario puede eliminar.
    
    PARAMS:
        - comment_id: ID del comentario
        
    Returns:
        200: Comment deleted
        403: Not authorized
        404: Comment not found
        500: Internal error
        
    Requiere: Token JWT
    """
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'message': 'Comment not found'}), 404

        if comment.id_user != current_user.id:
            return jsonify({'message': 'Not authorized to delete this comment'}), 403

        db.session.delete(comment)
        db.session.commit()

        return jsonify({'message': 'Comment deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500