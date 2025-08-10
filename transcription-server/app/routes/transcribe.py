from flask import Blueprint, request, jsonify
from app.utils.auth import get_user_id_from_jwt
from app.services.transcribe_service import transcribe_audio_from_url


transcribe_bp = Blueprint('transcribe', __name__)


@transcribe_bp.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid Authorization header'}), 401

    jwt_token = auth_header.split(' ')[1]
    user_id = get_user_id_from_jwt(jwt_token)
    if not user_id:
        return jsonify({'error': 'Invalid or expired token'}), 401

    data = request.get_json(silent=True) or {}
    audio_url = data.get('audio_url')
    if not audio_url:
        return jsonify({'error': 'Missing audio_url'}), 400

    try:
        transcription = transcribe_audio_from_url(audio_url)
        return jsonify({'transcription': transcription}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


