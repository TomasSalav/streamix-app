from flask import Blueprint, jsonify

bp = Blueprint('api', __name__, url_prefix='/api')

from . import auth, users, videos, comments, reactions, subscriptions, views


@bp.route('/', methods=['GET'])
def index():
    """Ruta raíz del API."""
    return jsonify({'message': 'Streamix API is running'}), 200