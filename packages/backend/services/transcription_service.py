import os
import logging
import asyncio
import whisper
import speech_recognition as sr
from pydub import AudioSegment
from typing import Optional

logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        # Initialize Whisper model
        try:
            self.whisper_model = whisper.load_model("base")
            logger.info("Whisper model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {str(e)}")
            self.whisper_model = None
        
        # Initialize SpeechRecognition
        self.recognizer = sr.Recognizer()
    
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribe audio file using both Whisper and SpeechRecognition
        """
        try:
            logger.info(f"Starting transcription of {audio_file_path}")
            
            # Convert audio to WAV if needed
            wav_path = await self._convert_to_wav(audio_file_path)
            
            # Try Whisper first (more accurate)
            if self.whisper_model:
                try:
                    transcript = await self._transcribe_with_whisper(wav_path)
                    if transcript and transcript.strip():
                        logger.info("Transcription completed with Whisper")
                        return transcript.strip()
                except Exception as e:
                    logger.warning(f"Whisper transcription failed: {str(e)}")
            
            # Fallback to SpeechRecognition
            try:
                transcript = await self._transcribe_with_speechrecognition(wav_path)
                if transcript and transcript.strip():
                    logger.info("Transcription completed with SpeechRecognition")
                    return transcript.strip()
            except Exception as e:
                logger.warning(f"SpeechRecognition transcription failed: {str(e)}")
            
            # If both fail, return empty string
            logger.error("Both transcription methods failed")
            return ""
            
        except Exception as e:
            logger.error(f"Error in transcription: {str(e)}")
            raise
        finally:
            # Clean up temporary WAV file
            if 'wav_path' in locals() and wav_path != audio_file_path:
                try:
                    os.remove(wav_path)
                except:
                    pass
    
    async def _convert_to_wav(self, audio_file_path: str) -> str:
        """
        Convert audio file to WAV format
        """
        try:
            # Check if already WAV
            if audio_file_path.lower().endswith('.wav'):
                return audio_file_path
            
            # Load audio with pydub
            audio = AudioSegment.from_file(audio_file_path)
            
            # Export as WAV
            wav_path = audio_file_path.rsplit('.', 1)[0] + '.wav'
            audio.export(wav_path, format="wav")
            
            logger.info(f"Converted audio to WAV: {wav_path}")
            return wav_path
            
        except Exception as e:
            logger.error(f"Error converting audio to WAV: {str(e)}")
            # Return original path if conversion fails
            return audio_file_path
    
    async def _transcribe_with_whisper(self, audio_file_path: str) -> str:
        """
        Transcribe using OpenAI Whisper
        """
        try:
            # Run Whisper in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self.whisper_model.transcribe, 
                audio_file_path
            )
            
            return result["text"]
            
        except Exception as e:
            logger.error(f"Whisper transcription error: {str(e)}")
            raise
    
    async def _transcribe_with_speechrecognition(self, audio_file_path: str) -> str:
        """
        Transcribe using SpeechRecognition
        """
        try:
            # Run SpeechRecognition in thread pool
            loop = asyncio.get_event_loop()
            
            def recognize_audio():
                with sr.AudioFile(audio_file_path) as source:
                    audio = self.recognizer.record(source)
                    return self.recognizer.recognize_google(audio, language="he-IL")
            
            transcript = await loop.run_in_executor(None, recognize_audio)
            return transcript
            
        except sr.UnknownValueError:
            logger.warning("SpeechRecognition could not understand audio")
            return ""
        except sr.RequestError as e:
            logger.error(f"SpeechRecognition request error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"SpeechRecognition error: {str(e)}")
            raise
    
    def detect_language(self, audio_file_path: str) -> Optional[str]:
        """
        Detect the language of the audio file
        """
        try:
            if self.whisper_model:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    self.whisper_model.transcribe,
                    audio_file_path,
                    {"task": "language"}
                )
                return result.get("language")
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
        
        return None 