"""
Rutas para listas personales: Ver más tarde, Mi Lista, Videos que me gustan.
"""
from . import bp
from .auth import token_required
from ..extensions import db
from ..models.video import Video
from ..models.reaction import Reaction
from ..models.watch_later import WatchLater
from ..models.my_list import MyList
from ..models.subscription import Subscription
from flask import request, jsonify


@bp.route('/users/me/liked', methods=['GET'])
@token_required
def get_liked_videos(current_user):
    """
    Obtiene los videos a los que el usuario ha dado like.
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    responses:
      200:
        description: Videos that the user liked
      500:
        description: Internal server error
    """
    try:
        likes = Reaction.query.filter_by(id_user=current_user.id, reaction_type='like').all()
        video_ids = [like.id_video for like in likes]
        videos = Video.query.filter(Video.id.in_(video_ids)).order_by(Video.created_at.desc()).all()
        
        return jsonify({
            'message': 'Liked videos retrieved',
            'videos': [v.to_dict() for v in videos]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/me/watch_later', methods=['GET'])
@token_required
def get_watch_later(current_user):
    """
    Obtiene los videos de la lista Ver Más Tarde.
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    responses:
      200:
        description: Watch Later videos
      500:
        description: Internal server error
    """
    try:
        entries = WatchLater.query.filter_by(id_user=current_user.id).order_by(WatchLater.created_at.desc()).all()
        videos = [entry.video for entry in entries if entry.video]
        
        return jsonify({
            'message': 'Watch later videos retrieved',
            'videos': [v.to_dict() for v in videos]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/watch_later', methods=['POST'])
@token_required
def toggle_watch_later(current_user, video_id):
    """
    Agrega o quita un video de Ver Más Tarde.
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    parameters:
      - in: path
        name: video_id
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Video removed from Watch Later
      201:
        description: Video added to Watch Later
      404:
        description: Video not found
      500:
        description: Internal server error
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        existing = WatchLater.query.filter_by(id_user=current_user.id, id_video=video_id).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'message': 'Video removed from Watch Later', 'in_list': False}), 200

        entry = WatchLater(id_user=current_user.id, id_video=video_id)
        db.session.add(entry)
        db.session.commit()
        
        return jsonify({'message': 'Video added to Watch Later', 'in_list': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/me/my_list', methods=['GET'])
@token_required
def get_my_list(current_user):
    """
    Obtiene los videos de Mi Lista.
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    responses:
      200:
        description: My List videos
      500:
        description: Internal server error
    """
    try:
        entries = MyList.query.filter_by(id_user=current_user.id).order_by(MyList.created_at.desc()).all()
        videos = [entry.video for entry in entries if entry.video]
        
        return jsonify({
            'message': 'My list videos retrieved',
            'videos': [v.to_dict() for v in videos]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/videos/<int:video_id>/my_list', methods=['POST'])
@token_required
def toggle_my_list(current_user, video_id):
    """
    Agrega o quita un video de Mi Lista.
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    parameters:
      - in: path
        name: video_id
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Video removed from My List
      201:
        description: Video added to My List
      404:
        description: Video not found
      500:
        description: Internal server error
    """
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404

        existing = MyList.query.filter_by(id_user=current_user.id, id_video=video_id).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'message': 'Video removed from My List', 'in_list': False}), 200

        entry = MyList(id_user=current_user.id, id_video=video_id)
        db.session.add(entry)
        db.session.commit()
        
        return jsonify({'message': 'Video added to My List', 'in_list': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@bp.route('/users/me/subscriptions/videos', methods=['GET'])
@token_required
def get_subscriptions_videos(current_user):
    """
    Obtiene los videos de los canales a los que el usuario está suscrito.
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    responses:
      200:
        description: Videos from subscribed channels
      500:
        description: Internal server error
    """
    try:
        subs = Subscription.query.filter_by(id_subscriber=current_user.id).all()
        subscribed_ids = [sub.id_subscribed for sub in subs]
        
        if not subscribed_ids:
            return jsonify({'message': 'No subscriptions found', 'videos': []}), 200
            
        videos = Video.query.filter(Video.id_user.in_(subscribed_ids)).order_by(Video.created_at.desc()).all()
        
        return jsonify({
            'message': 'Subscription videos retrieved',
            'videos': [v.to_dict() for v in videos]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500