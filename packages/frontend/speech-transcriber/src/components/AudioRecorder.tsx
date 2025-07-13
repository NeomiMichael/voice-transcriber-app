import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('שגיאה בהתחלת ההקלטה')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadAudio = async () => {
    if (!audioBlob || !displayName.trim()) {
      alert('אנא הכניסי שם לקובץ')
      return
    }

    setUploading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('לא מחובר')

      const fileName = `${Date.now()}_${displayName}.webm`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, audioBlob)

      if (uploadError) throw uploadError

      // Create transcript record
      const { error: dbError } = await supabase
        .from('transcripts')
        .insert({
          user_id: user.id,
          file_name: fileName,
          display_name: displayName,
          status: 'uploaded',
          duration_seconds: Math.round(audioBlob.size / 16000) // rough estimate
        })

      if (dbError) throw dbError

      alert('הקובץ הועלה בהצלחה!')
      setAudioBlob(null)
      setDisplayName('')
    } catch (error: any) {
      console.error('Error uploading:', error)
      alert(`שגיאה בהעלאת הקובץ: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="audio-recorder">
      <h3>הקלטת קול</h3>
      
      <div className="recording-controls">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="record-btn"
            disabled={uploading}
          >
            התחל הקלטה
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="stop-btn"
          >
            עצור הקלטה
          </button>
        )}
      </div>

      {audioBlob && (
        <div className="audio-preview">
          <h4>תצוגה מקדימה:</h4>
          <audio controls src={URL.createObjectURL(audioBlob)} />
          
          <div className="upload-section">
            <input
              type="text"
              placeholder="שם הקובץ"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="file-name-input"
            />
            <button 
              onClick={uploadAudio}
              disabled={uploading || !displayName.trim()}
              className="upload-btn"
            >
              {uploading ? 'מעלה...' : 'העלה קובץ'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 