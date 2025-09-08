import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase/supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { API_BASE_URL } from '../../../config'

interface Props {
  onUploadSuccess: () => void
}

function UploadAudioForm({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [ytMessage, setYtMessage] = useState('')

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        console.error('שגיאה בקבלת session:', error?.message)
        setMessage('שגיאה בזיהוי המשתמש')
        return
      }

      setUserId(session.user.id)
      const accessToken = session.access_token
      if (!accessToken) {
        console.error('לא נמצא access token')
        setMessage('שגיאה בקבלת טוקן')
        return
      }
    }

    getSession()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !userId) {
      setMessage('אין קובץ או משתמש מחובר')
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: storageError } = await supabase.storage
      .from('recordings')
      .upload(filePath, file)

    if (storageError) {
      setMessage(`שגיאה בהעלאה: ${storageError.message}`)
      return
    }

    const { data: publicData } = supabase.storage
      .from('recordings')
      .getPublicUrl(filePath)

    const publicUrl = publicData?.publicUrl

    const { error: insertError } = await supabase
      .from('recordings')
      .insert([{
        user_id: userId,
        file_name: file.name,
        url: publicUrl,
      }])

    if (insertError) {
      setMessage(`שגיאה בשמירה במסד: ${insertError.message}`)
    } else {
      setMessage('✅ קובץ הועלה ונשמר בהצלחה!')
      setFile(null)
      onUploadSuccess()
    }
  }

  const handleYoutubeDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setYtMessage('')
    if (!youtubeUrl || !userId) {
  setYtMessage('יש להזין קישור ולהיות מחובר')
  return
}

const session = (await supabase.auth.getSession()).data.session
const token = session?.access_token
if (!token) {
  setYtMessage('לא נמצא access token עדכני')
  return
}


    try {
      setYtMessage('מוריד ומעלה...')
      const res = await fetch(`${API_BASE_URL}/download_youtube_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          url: youtubeUrl,
          user_id: userId
        })
      })

      const data = await res.json()
      if (data.success) {
        setYtMessage('✅ האודיו נוסף לרשימת ההקלטות!')
        setYoutubeUrl('')
        onUploadSuccess()
      } else {
        setYtMessage('שגיאה: ' + (data.error || ''))
      }
    } catch (err: any) {
      setYtMessage('שגיאה: ' + (err.message || err))
    }
  }

  return (
    <>
      <form className="form" onSubmit={handleUpload}>
        <div className="actions">
          <input className="input" type="file" accept="audio/*" onChange={handleFileChange} />
          <button className="btn" type="submit">העלה</button>
        </div>
        {message && <p>{message}</p>}
      </form>

      <form className="form" onSubmit={handleYoutubeDownload}>
        <input
          className="input"
          type="text"
          placeholder="הדבק כאן קישור ליוטיוב"
          value={youtubeUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeUrl(e.target.value)}
        />
        <button className="btn info" type="submit">הורד מיוטיוב</button>
        {ytMessage && <p>{ytMessage}</p>}
      </form>
    </>
  )
}

export default UploadAudioForm
