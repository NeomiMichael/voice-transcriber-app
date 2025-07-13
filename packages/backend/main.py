from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import tempfile
import asyncio
from typing import List
import logging
from dotenv import load_dotenv

from services.supabase_service import SupabaseService
from services.transcription_service import TranscriptionService
from models.transcript import TranscriptCreate, TranscriptResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Speech Transcription API",
    description="API for transcribing audio files using Whisper and SpeechRecognition",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
supabase_service = SupabaseService()
transcription_service = TranscriptionService()

@app.get("/")
async def root():
    return {"message": "Speech Transcription API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "speech-transcription-api"}

@app.post("/api/transcribe", response_model=TranscriptResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    user_id: str = None,
    display_name: str = None
):
    """
    Transcribe an uploaded audio file
    """
    try:
        logger.info(f"Starting transcription for file: {file.filename}")
        
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Update status to processing
            transcript_data = TranscriptCreate(
                user_id=user_id,
                file_name=file.filename,
                display_name=display_name or file.filename,
                status="processing"
            )
            
            # Insert into database
            transcript_id = await supabase_service.create_transcript(transcript_data)
            
            # Transcribe the audio
            transcript_text = await transcription_service.transcribe_audio(temp_file_path)
            
            # Update with results
            await supabase_service.update_transcript(
                transcript_id,
                transcript_text=transcript_text,
                status="done"
            )
            
            logger.info(f"Transcription completed for file: {file.filename}")
            
            return TranscriptResponse(
                id=transcript_id,
                user_id=user_id,
                file_name=file.filename,
                display_name=display_name or file.filename,
                transcript_text=transcript_text,
                status="done"
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        logger.error(f"Error transcribing file {file.filename}: {str(e)}")
        
        # Update status to failed if we have a transcript_id
        if 'transcript_id' in locals():
            await supabase_service.update_transcript(
                transcript_id,
                status="failed"
            )
        
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/api/transcripts/{user_id}", response_model=List[TranscriptResponse])
async def get_user_transcripts(user_id: str):
    """
    Get all transcripts for a specific user
    """
    try:
        transcripts = await supabase_service.get_user_transcripts(user_id)
        return transcripts
    except Exception as e:
        logger.error(f"Error fetching transcripts for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch transcripts: {str(e)}")

@app.get("/api/transcript/{transcript_id}", response_model=TranscriptResponse)
async def get_transcript(transcript_id: str):
    """
    Get a specific transcript by ID
    """
    try:
        transcript = await supabase_service.get_transcript(transcript_id)
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        return transcript
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching transcript {transcript_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch transcript: {str(e)}")

@app.delete("/api/transcript/{transcript_id}")
async def delete_transcript(transcript_id: str):
    """
    Delete a specific transcript
    """
    try:
        success = await supabase_service.delete_transcript(transcript_id)
        if not success:
            raise HTTPException(status_code=404, detail="Transcript not found")
        return {"message": "Transcript deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting transcript {transcript_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete transcript: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 