import os
from typing import Optional

"""
Model cache utilities: download and cache the model using huggingface_hub
with hf_transfer disabled so it won't use the Rust downloader/ CAS.
"""

# Must disable hf_transfer before importing huggingface_hub
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "0")

from huggingface_hub import snapshot_download  # noqa: E402


REPO_ID = "ivrit-ai/whisper-large-v3-turbo-ct2"


def get_cache_dir() -> str:
    # Prefer HF_HOME if provided; fall back to /app/storage/hf-cache inside Docker
    cache_dir = os.getenv("HF_HOME") or "/app/storage/hf-cache"
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def ensure_model_downloaded() -> str:
    cache_dir = get_cache_dir()
    token: Optional[str] = os.getenv("HUGGINGFACE_TOKEN") or None

    # Download full repo snapshot to local cache folder (idempotent).
    # With hf_transfer disabled, it should use Python requests with certifi.
    local_dir = snapshot_download(
        repo_id=REPO_ID,
        cache_dir=cache_dir,
        local_files_only=False,
        token=token,
        # do not restrict patterns to avoid missing required files
    )
    return local_dir


