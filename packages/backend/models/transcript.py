from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class TranscriptStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class TranscriptCreate(BaseModel):
    user_id: Optional[str] = None
    file_name: str = Field(..., description="Name of the uploaded file")
    display_name: str = Field(..., description="Display name for the transcript")
    transcript_text: Optional[str] = None
    status: TranscriptStatus = TranscriptStatus.UPLOADED
    duration_seconds: Optional[int] = None
    language: Optional[str] = None

class TranscriptResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    file_name: str
    display_name: str
    transcript_text: Optional[str] = None
    status: TranscriptStatus
    created_at: datetime
    duration_seconds: Optional[int] = None
    language: Optional[str] = None

    class Config:
        from_attributes = True

class TranscriptUpdate(BaseModel):
    transcript_text: Optional[str] = None
    status: Optional[TranscriptStatus] = None
    duration_seconds: Optional[int] = None
    language: Optional[str] = None 