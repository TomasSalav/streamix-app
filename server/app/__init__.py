from flask import Flask
from .config import Config

def create_app():
    app = Flask(__name__)
    
    # Load configuration from .env file
    app.config.from_object(Config)

    # Initialize extensions
    from .extensions import db, migrate, cors

    try:
        db.init_app(app)
        migrate.init_app(app, db)
        cors.init_app(app)
    except Exception as e:
        print(f"Error initializing extensions: {e}")

    # Register blueprints
    from .routes import bp
    app.register_blueprint(bp)

    return app