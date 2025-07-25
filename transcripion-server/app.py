import os
from dotenv import load_dotenv
import requests
import yt_dlp
import uuid
import traceback
import mimetypes
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client


load_dotenv()
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'storage'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def get_user_id_from_jwt(jwt_token):
    response = requests.get(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {jwt_token}",
            "apikey": SUPABASE_ANON_KEY
        }
    )
    if response.status_code != 200:
        print(f"Auth error {response.status_code}: {response.text}")
        return None
    return response.json().get("id")

def upload_to_supabase_storage(file_path, file_data, supabase_url, service_role_key, bucket='recordings'):
    storage_url = f"{supabase_url}/storage/v1/object/{bucket}/{file_path}"
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
        "Content-Type": mimetypes.guess_type(file_path)[0] or "application/octet-stream"
    }
    response = requests.post(storage_url, headers=headers, data=file_data)
    return response

@app.route('/download_youtube_audio', methods=['POST'])
def download_youtube_audio():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401

        jwt_token = auth_header.split(' ')[1]
        user_id = get_user_id_from_jwt(jwt_token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401

        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({'error': 'Missing YouTube URL'}), 400

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(UPLOAD_FOLDER, '%(title)s.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'verify': False,
            'nocheckcertificate': True,
            'ffmpeg_location': r'C:\Users\1\Downloads\ffmpeg-7.1.1-essentials_build\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            audio_file = os.path.splitext(filename)[0] + '.mp3'

        file_name = f"{uuid.uuid4()}.mp3"
        file_path = f"{user_id}/{file_name}"

        # העלאה ישירה ל-Supabase Storage
        with open(audio_file, 'rb') as f:
            file_data = f.read()
        upload_response = upload_to_supabase_storage(file_path, file_data, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("Upload response:", upload_response.status_code, upload_response.text)
        if upload_response.status_code not in [200, 201]:
            return jsonify({'error': 'Failed to upload to Supabase Storage', 'details': upload_response.text}), 500

        # קבלת public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/recordings/{file_path}"

        # שמירה במסד
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        insert_res = supabase.table('recordings').insert({
            'user_id': user_id,
            'file_name': info.get('title', file_name) + '.mp3',
            'url': public_url
        }).execute()
        print("Insert DB response:", insert_res)
        if not insert_res.data:
            return jsonify({'error': 'Failed to insert to DB', 'details': str(insert_res)}), 500

        os.remove(audio_file)

        return jsonify({'success': True, 'file': file_name, 'public_url': public_url}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
