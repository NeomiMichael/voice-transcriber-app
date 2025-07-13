# Speech Transcription Backend

שרת FastAPI לתמלול קבצי אודיו באמצעות Whisper ו-SpeechRecognition.

## התקנה

1. **התקן את התלויות:**
```bash
pip install -r requirements.txt
```

2. **הגדר משתני סביבה:**
צור קובץ `.env` עם התוכן הבא:
```env
SUPABASE_URL=https://lfprpgixrxacelcqhlamz.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
HOST=0.0.0.0
PORT=8000
```

## הרצה

```bash
python run.py
```

או:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - בדיקת חיבור
- `GET /health` - בדיקת בריאות השרת
- `POST /api/transcribe` - תמלול קובץ אודיו
- `GET /api/transcripts/{user_id}` - קבלת כל התמלולים של משתמש
- `GET /api/transcript/{transcript_id}` - קבלת תמלול ספציפי
- `DELETE /api/transcript/{transcript_id}` - מחיקת תמלול

## תיעוד API

לאחר הפעלת השרת, גשי ל:
- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/redoc - ReDoc

## מבנה הפרויקט

```
backend/
├── main.py                 # הקובץ הראשי של FastAPI
├── run.py                  # קובץ הרצה
├── requirements.txt        # תלויות Python
├── models/                 # מודלי Pydantic
│   └── transcript.py
└── services/              # שירותים
    ├── supabase_service.py
    └── transcription_service.py
``` 