import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase/supabaseClient'

interface Recording {
  id: string
  file_name: string
  url: string
  created_at: string
}

function MyRecordingsList() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecordings = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) return

      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('שגיאה בשליפה:', error.message)
      } else {
        setRecordings(data || [])
      }

      setLoading(false)
    }

    fetchRecordings()
  }, [])

  const handleDelete = async (rec: Recording) => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return

    const fileName = rec.url.split('/').pop() // רק שם הקובץ
    const filePath = `${userId}/${fileName}`

    // 1. מחיקה מה-Storage
    const { error: storageError } = await supabase.storage
      .from('recordings')
      .remove([filePath])

    if (storageError) {
      alert('שגיאה במחיקת הקובץ מהסטורג׳: ' + storageError.message)
      return
    }

    // 2. מחיקה מה-Database
    const { error: dbError } = await supabase
      .from('recordings')
      .delete()
      .eq('id', rec.id)

    if (dbError) {
      alert('שגיאה במחיקת הרשומה: ' + dbError.message)
    } else {
      setRecordings((prev) => prev.filter((r) => r.id !== rec.id))
    }
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>🎧 הקבצים שהעלתי</h2>
      {loading ? (
        <p>טוען קבצים...</p>
      ) : recordings.length === 0 ? (
        <p>לא נמצאו קבצים</p>
      ) : (
        <ul>
          {recordings.map((rec) => (
            <li key={rec.id} style={{ marginBottom: '20px' }}>
              <strong>{rec.file_name}</strong>
              <br />
              <audio controls src={rec.url} style={{ width: '100%' }} />
              <br />
              <button
                onClick={() => handleDelete(rec)}
                style={{
                  marginTop: '5px',
                  color: 'white',
                  background: 'red',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                🗑️ מחק קובץ
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyRecordingsList
