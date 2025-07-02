# voice-transcriber-app
 🗣️ Full-stack AI-powered voice transcription app built with React, Python, and Supabase. Supports audio recording, file uploads, automatic transcription using Whisper, and secure user authentication.
# Supabase Voice Transcriber

🗣️ **AI-Powered Full-Stack Voice Transcription Application**  
Built with React, Python (FastAPI), and Supabase

---

## Project Overview

Supabase Voice Transcriber is a scalable, secure web application that enables users to record audio directly via their browser or upload existing audio files, and receive automatic transcriptions powered by OpenAI's Whisper model. The system leverages Supabase for authentication, storage, and database management, ensuring robust user management and secure file handling.

---

## Key Features

- **User Authentication & Authorization:**  
  Email/password login, Google OAuth2 sign-in, and password reset flows using Supabase Auth  
- **Audio Capture:**  
  Real-time audio recording via MediaRecorder API  
- **File Uploads:**  
  Support for uploading audio files (mp3, wav)  
- **Cloud Storage:**  
  Audio files securely stored in Supabase Storage buckets with access control  
- **Automatic Transcription:**  
  Backend transcription service powered by OpenAI Whisper model via Python FastAPI  
- **Transcription Management:**  
  View, download, and manage transcriptions per user with a full history and status tracking  
- **Secure Data Access:**  
  Per-user access control enforced via Supabase policies and JWTs  

---

## Technology Stack

| Component        | Technology             |
|------------------|------------------------|
| Frontend         | React, TypeScript      |
| Backend          | Python (FastAPI)       |
| Transcription AI | OpenAI Whisper Model   |
| Database         | Supabase (PostgreSQL)  |
| Storage          | Supabase Storage       |
| Authentication   | Supabase Auth + OAuth2 |

---

## Getting Started

### Prerequisites

- Node.js v16+  
- Python 3.9+  
- Supabase account and project setup  

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).  
2. Enable authentication providers (Email & Google OAuth2).  
3. Create a storage bucket for audio file uploads.  
4. Retrieve your Supabase project URL and API keys.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
