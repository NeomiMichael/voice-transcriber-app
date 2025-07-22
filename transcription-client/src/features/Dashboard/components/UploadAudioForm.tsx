import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  onUploadSuccess: () => void
}

function UploadAudioForm({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('שגיאה בקבלת session:', error.message)
        setMessage('שגיאה בזיהוי המשתמש')
        return
      }

      const uid = session?.user.id ?? null
      console.log('userId מתוך session:', uid)
      setUserId(uid)
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

    // 1. העלאת הקובץ ל־Storage
    const { error: storageError } = await supabase.storage
      .from('recordings')
      .upload(filePath, file)

    if (storageError) {
      console.error('שגיאה בהעלאה ל־Storage:', storageError)
      setMessage(`שגיאה בהעלאה: ${storageError.message}`)
      return
    }

    const { data: publicData } = supabase.storage
      .from('recordings')
      .getPublicUrl(filePath)

    const publicUrl = publicData?.publicUrl

    console.log('url של הקובץ:', publicUrl)

    // 2. שמירת פרטי ההקלטה בטבלה
    const { error: insertError } = await supabase
      .from('recordings')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          url: publicUrl,
        },
      ])

    if (insertError) {
      console.error('שגיאה בהכנסת שורה לטבלה:', insertError)
      setMessage(`שגיאה בשמירה במסד: ${insertError.message}`)
    } else {
      setMessage('✅ קובץ הועלה ונשמר בהצלחה!')
      setFile(null)
      onUploadSuccess() // 🔁 ריענון מיידי של הרשימה
    }
  }

  return (
    <form onSubmit={handleUpload} style={{ marginTop: '30px' }}>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button type="submit" style={{ marginLeft: '10px' }}>העלה</button>
      {message && <p>{message}</p>}
    </form>
  )
}

export default UploadAudioForm
