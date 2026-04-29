from . import bp
from ..models.user import User
from ..models.comment import Comment
from ..models.video import Video
from flask import request
from ..extensions import db

MAIN_PATH='/api'

@bp.route('/')
@bp.route(f'{MAIN_PATH}/')
def index():
    return {'msg':'Backend is working!'}

@bp.route(f'{MAIN_PATH}/user/create', methods=["POST","GET"])
def sign_up():
    try:
        data = request.get_json()
        user = User(
            username=data['username'],
        )
        if User.query.filter_by(email=data['email']).first():
            return {'msg': 'This email is in database.'}, 400

        user.email = data['email']
        user.password = data['password']

        db.session.add(user)
        db.session.commit()

        return {'msg':'User created successfully.'}, 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Somethings went wrong!: {e}")
        return {'msg': f"Somethings went wrong!: {e}"}, 400

@bp.route(f'{MAIN_PATH}/login')
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return {'msg': 'This user is not in database.',
                    'data': None}, 400
        if user.check_password(data['password']):
            return {'msg': 'User is logged in.',
                    'data': user.to_dict()}, 200
        return {'msg': 'The password is incorrect.',
                    'data': user.to_dict()}, 400
    except Exception as e:
        print(f"Somethings went wrong!: {e}")
        return {'msg': f"Somethings went wrong!: {e}"}, 400
    
@bp.route(f'{MAIN_PATH}/video/create')
def create_video():
    try:
        data = request.get_json()
        video = Video(
            title=data['title'],
            description=data['description'],
            id_user=data['id_user']
        )

        db.session.add(video)
        db.session.commit()

    except Exception as e:
        print(f"Somethings went wrong!: {e}")
        return {'msg': f"Somethings went wrong!: {e}"}, 400
    
@bp.route(f'{MAIN_PATH}/video/get')
def get_videos():
    try:
        videos = Video.query.all()
        return {
            'msg':'All the videos were retrieved.',
            'data': [video.to_dict() for video in videos]
        }, 200
    except Exception as e:
        print(f"Somethings went wrong!: {e}")
        return {'msg': f"Somethings went wrong!: {e}"}, 400
    
@bp.route(f'{MAIN_PATH}/video/<int:id>')
def get_video(id):
    try:
        video = Video.query.filter_by(id=id).first()
        if not video:
            return {'msg': 'This video is not in database.',
                    'data': None}, 400
        return {
            'msg':'Video retrieved successfully',
            'data': video.to_dict()
            }, 200
    except Exception as e:
        print(f"Somethings went wrong!: {e}")
        return {'msg': f"Somethings went wrong!: {e}"}, 400
    
@bp.route(f'{MAIN_PATH}/view/create')
def save_view():
    data = request.get_data()
    
    #TODO: Implementar la lógica restante