from flask import Flask, send_from_directory
from flasgger import Swagger
from .config import Config
import json
import os


def create_app():
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
    os.makedirs(public_dir, exist_ok=True)
    app = Flask(__name__, static_folder=public_dir, static_url_path='/public')
    app.config.from_object(Config)

    from .extensions import db, migrate, cors
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    from .routes import bp
    app.register_blueprint(bp)
    
    # Load swagger spec from file
    spec_path = os.path.join(os.path.dirname(__file__), 'swagger_spec.json')
    with open(spec_path, 'r', encoding='utf-8') as f:
        swagger_template = json.load(f)
    
    Swagger(app, template=swagger_template)

    @app.route('/docs/')
    def docs():
        return '''<!DOCTYPE html><html><head>
<link rel="stylesheet" href="/flasgger_static/swagger-ui.css">
<script src="/flasgger_static/swagger-ui-bundle.js"></script>
<script src="/flasgger_static/swagger-ui-standalone-preset.js"></script>
</head><body>
<div id="swagger-ui"></div>
<script>
SwaggerUIBundle({
  url: "/apispec_1.json",
  dom_id: "#swagger-ui",
  deepLinking: true,
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
  layout: "StandaloneLayout"
})
</script>
<style>body{padding:0;margin:0;}</style></body></html>'''

    return app
