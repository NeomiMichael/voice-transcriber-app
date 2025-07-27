from flask import Flask
from app.routes.youtube import youtube_bp as youtube_blueprint
from flask_cors import CORS  


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(youtube_blueprint)
    return app
