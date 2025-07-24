import { useState, useRef } from 'react'
import { supabase } from '../../../supabase/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

type RecordAudioProps = {
  onUploadSuccess: () => void
}

function RecordAudio({ onUploadSuccess }: RecordAudioProps) {
    interface RecordAudioProps {
  onUploadSuccess: () => void
}

  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
      const url = URL.createObjectURL(blob)
      setAudioURL(url)
      audioChunks.current = []
    }

    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const uploadRecording = async () => {
    if (!audioURL) {
      setMessage('לא הוקלט קובץ')
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      setMessage('שגיאת התחברות – נסי להתחבר מחדש')
      return
    }

    const fileName = `${uuidv4()}.webm`
    const filePath = `${userId}/${fileName}`

    const response = await fetch(audioURL)
    const audioBlob = await response.blob()

    const { error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(filePath, audioBlob)

    if (uploadError) {
      setMessage(`שגיאה בהעלאה: ${uploadError.message}`)
      return
    }

    const publicUrl = supabase.storage
      .from('recordings')
      .getPublicUrl(filePath).data.publicUrl

    const { error: dbError } = await supabase
      .from('recordings')
      .insert([
        {
          user_id: userId,
          file_name: fileName,
          url: publicUrl,
        },
      ])

    if (dbError) {
      setMessage(`שגיאה בשמירה במסד: ${dbError.message}`)
    } else {
      setMessage('✅ הקובץ הועלה בהצלחה!')
      setAudioURL(null)
        onUploadSuccess() // ← הוסיפי את השורה הזו כאן
    }
  }

  return (
    <div style={{ direction: 'rtl', padding: '15px' }}>
      <h2>🎤 הקלטה חדשה</h2>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          backgroundColor: isRecording ? '#f0ad4e' : '#0275d8',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '15px',
        }}
      >
        {isRecording ? '⏹️ עצור הקלטה' : '🎙️ התחל הקלטה'}
      </button>

      {audioURL && (
        <div style={{ marginTop: '15px' }}>
          <p>🎧 תצוגת הקלטה:</p>
          <audio controls src={audioURL} style={{ width: '100%' }} />
          <br />
          <button
            onClick={uploadRecording}
            style={{
              marginTop: '10px',
              backgroundColor: '#5cb85c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            ⬆️ העלאה ל־Supabase
          </button>
        </div>
      )}

      {message && (
        <p style={{ marginTop: '10px', color: '#5bc0de' }}>{message}</p>
      )}
    </div>
  )
}

export default RecordAudio