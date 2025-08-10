from flask import Flask
from app.routes.youtube import youtube_bp as youtube_blueprint
from app.routes.transcribe import transcribe_bp as transcribe_blueprint
from flask_cors import CORS  
from threading import Thread

def _warmup_model_async():
    try:
        from app.services.model_cache import ensure_model_downloaded
        ensure_model_downloaded()
    except Exception:
        # Warmup failures shouldn't block server start
        pass


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(youtube_blueprint)
    app.register_blueprint(transcribe_blueprint)
    # Warmup model download in background to avoid first-request latency/timeouts
    Thread(target=_warmup_model_async, daemon=True).start()
    return app
