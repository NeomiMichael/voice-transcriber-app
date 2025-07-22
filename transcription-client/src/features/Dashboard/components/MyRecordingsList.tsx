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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyRecordingsList
