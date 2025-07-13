import os
import logging
from typing import List, Optional
from supabase import create_client, Client
from models.transcript import TranscriptCreate, TranscriptResponse, TranscriptUpdate

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL", "https://lfprpgixrxacelcqhlamz.supabase.co")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_key:
            raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    async def create_transcript(self, transcript_data: TranscriptCreate) -> str:
        """
        Create a new transcript record in the database
        """
        try:
            data = transcript_data.model_dump()
            
            # Remove None values
            data = {k: v for k, v in data.items() if v is not None}
            
            result = self.supabase.table("transcripts").insert(data).execute()
            
            if result.data:
                transcript_id = result.data[0]["id"]
                logger.info(f"Created transcript with ID: {transcript_id}")
                return transcript_id
            else:
                raise Exception("Failed to create transcript")
                
        except Exception as e:
            logger.error(f"Error creating transcript: {str(e)}")
            raise
    
    async def get_transcript(self, transcript_id: str) -> Optional[TranscriptResponse]:
        """
        Get a transcript by ID
        """
        try:
            result = self.supabase.table("transcripts").select("*").eq("id", transcript_id).execute()
            
            if result.data:
                return TranscriptResponse(**result.data[0])
            return None
            
        except Exception as e:
            logger.error(f"Error fetching transcript {transcript_id}: {str(e)}")
            raise
    
    async def get_user_transcripts(self, user_id: str) -> List[TranscriptResponse]:
        """
        Get all transcripts for a specific user
        """
        try:
            result = self.supabase.table("transcripts").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            transcripts = []
            for row in result.data:
                transcripts.append(TranscriptResponse(**row))
            
            return transcripts
            
        except Exception as e:
            logger.error(f"Error fetching transcripts for user {user_id}: {str(e)}")
            raise
    
    async def update_transcript(self, transcript_id: str, **updates) -> bool:
        """
        Update a transcript record
        """
        try:
            # Remove None values
            update_data = {k: v for k, v in updates.items() if v is not None}
            
            if not update_data:
                return True
            
            result = self.supabase.table("transcripts").update(update_data).eq("id", transcript_id).execute()
            
            if result.data:
                logger.info(f"Updated transcript {transcript_id}")
                return True
            else:
                logger.warning(f"No transcript found with ID {transcript_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating transcript {transcript_id}: {str(e)}")
            raise
    
    async def delete_transcript(self, transcript_id: str) -> bool:
        """
        Delete a transcript record
        """
        try:
            result = self.supabase.table("transcripts").delete().eq("id", transcript_id).execute()
            
            if result.data:
                logger.info(f"Deleted transcript {transcript_id}")
                return True
            else:
                logger.warning(f"No transcript found with ID {transcript_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting transcript {transcript_id}: {str(e)}")
            raise
    
    async def get_audio_file(self, file_name: str) -> Optional[bytes]:
        """
        Download an audio file from Supabase Storage
        """
        try:
            result = self.supabase.storage.from_("audio-files").download(file_name)
            return result
            
        except Exception as e:
            logger.error(f"Error downloading file {file_name}: {str(e)}")
            return None 