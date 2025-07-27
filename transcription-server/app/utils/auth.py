import os
import requests

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

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
