from . import bp

@bp.route('/')
def index():
    return "It's working!"


@bp.route('/<string:name>')
def greet(name):
    return f"It's working! Hello, {name}!"
