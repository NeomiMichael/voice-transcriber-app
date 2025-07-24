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

    const fileName = rec.url.split('/').pop()
    const filePath = `${userId}/${fileName}`

    const { error: storageError } = await supabase.storage
      .from('recordings')
      .remove([filePath])

    if (storageError) {
      alert('שגיאה במחיקת הקובץ מהסטורג׳: ' + storageError.message)
      return
    }

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
    <div style={{ marginTop: '30px', direction: 'rtl' }}>
      <h2>📁 הקבצים שהעליתי</h2>
      {loading ? (
        <p>⏳ טוען קבצים...</p>
      ) : recordings.length === 0 ? (
        <p>אין קבצים להצגה</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recordings.map((rec) => (
            <li
              key={rec.id}
              style={{
                marginBottom: '25px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px 15px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{rec.file_name}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {new Date(rec.created_at).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              <audio controls src={rec.url} style={{ width: '100%', marginTop: '10px' }} />

              <button
                onClick={() => handleDelete(rec)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#d9534f',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
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
