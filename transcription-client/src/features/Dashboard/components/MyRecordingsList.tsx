import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase/supabaseClient'
import { API_BASE_URL } from '../../../config'

interface Recording {
  id: string
  file_name: string
  url: string
  created_at: string
}

function MyRecordingsList() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState<string>('')

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
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{ background: 'white', color: '#000', padding: 30, borderRadius: 10, minWidth: 300, maxWidth: 600 }}>
            <h3>תמלול</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>{currentTranscript}</div>
            <button onClick={() => setShowModal(false)} style={{ background: '#5bc0de', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 5, cursor: 'pointer' }}>סגור</button>
          </div>
        </div>
      )}
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

              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handleDelete(rec)}
                  style={{
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
                <button
  onClick={async () => {
    setCurrentTranscript('⏳ מבצע תמלול...');
    setShowModal(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setCurrentTranscript('שגיאה: לא נמצא טוקן התחברות');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/transcribe_audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          audio_url: rec.url
        })
      });

      const result = await res.json();

      if (!res.ok) {
        setCurrentTranscript(`❌ שגיאה: ${result.error || 'משהו השתבש'}`);
      } else {
        setCurrentTranscript(result.transcription || 'לא התקבל תמלול');
      }
    } catch (err) {
      console.error(err);
      setCurrentTranscript('❌ שגיאה לא צפויה בתמלול');
    }
  }}
  style={{
    backgroundColor: '#5bc0de',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
  }}
>
  לתמלול
</button>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyRecordingsList
