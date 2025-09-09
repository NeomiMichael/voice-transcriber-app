import os
import tempfile
import requests
from typing import Optional

os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "0")

from faster_whisper import WhisperModel
from app.services.model_cache import ensure_model_downloaded


_whisper_model: Optional[WhisperModel] = None


def _load_model() -> WhisperModel:
    global _whisper_model
    if _whisper_model is None:
        # Loads and caches the model on first use. Uses CPU by default.
        # The model will be downloaded from Hugging Face on first run.
        device = os.getenv("WHISPER_DEVICE", "cpu")
        preferred_compute = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
        # Ensure model is downloaded and available in local cache first
        local_model_dir = ensure_model_downloaded()
        cpu_threads = int(os.getenv("WHISPER_CPU_THREADS", str(max(1, (os.cpu_count() or 4) - 1))))
        num_workers = int(os.getenv("WHISPER_NUM_WORKERS", "2"))
        device_index_str = os.getenv("WHISPER_DEVICE_INDEX")

        init_kwargs = {
            "device": device,
            "compute_type": preferred_compute,
            "cpu_threads": cpu_threads,
            "num_workers": num_workers,
        }
        if device_index_str and device != "cpu":
            init_kwargs["device_index"] = int(device_index_str)

        try:
            _whisper_model = WhisperModel(
                local_model_dir,
                **init_kwargs,
            )
        except Exception:
            # Fallback to float32 for maximum compatibility
            init_kwargs_fallback = dict(init_kwargs)
            init_kwargs_fallback["compute_type"] = "float32"
            _whisper_model = WhisperModel(
                local_model_dir,
                **init_kwargs_fallback,
            )
    return _whisper_model


def transcribe_audio_from_url(audio_url: str) -> str:
    if not audio_url or not audio_url.startswith("http"):
        raise ValueError("Invalid audio_url")

    # Download the audio to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".audio") as tmp_file:
        tmp_path = tmp_file.name
        # Use generous read timeout for long files to avoid truncated downloads
        with requests.get(audio_url, stream=True, timeout=(10, 300)) as r:
            r.raise_for_status()
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    tmp_file.write(chunk)

    try:    
        model = _load_model()
        segments, _info = model.transcribe(
            tmp_path,
            language="he",
            task="transcribe",
            # Speed-optimized settings
            beam_size=1,  # greedy decoding
            temperature=0.0,
            # Improve continuity and reduce accidental truncation
            condition_on_previous_text=True,
            # Avoid VAD cutting out sung parts/music-like voice
            vad_filter=False,
            # Keep more borderline speech segments
            no_speech_threshold=0.2,
            log_prob_threshold=-1.0,
            without_timestamps=True,
            word_timestamps=False,
        )

        transcript_parts = [seg.text for seg in segments]
        transcript = " ".join(part.strip() for part in transcript_parts).strip()
        return transcript
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


