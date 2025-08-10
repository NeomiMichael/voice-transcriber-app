FROM python:3.11

RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    libffi-dev \
    libssl-dev \
    ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV HF_HUB_ENABLE_HF_TRANSFER=0
ENV HF_HOME=/app/storage/hf-cache

EXPOSE 5000

CMD ["python", "run.py"]
