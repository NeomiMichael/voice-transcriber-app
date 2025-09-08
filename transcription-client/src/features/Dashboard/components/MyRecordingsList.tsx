import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase/supabaseClient'
import { API_BASE_URL } from '../../../config'
import { downloadTranscriptPdf } from '../../../utils/pdf'

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
  const [currentId, setCurrentId] = useState<string>('')

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
    <div style={{ marginTop: '10px' }}>
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>תמלול</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>{currentTranscript}</div>
            <button className="btn info" onClick={() => setShowModal(false)}>סגור</button>
          </div>
        </div>
      )}
      <h2 className="title">📁 הקבצים שהעליתי</h2>
      {loading ? (
        <p>⏳ טוען קבצים...</p>
      ) : recordings.length === 0 ? (
        <p>אין קבצים להצגה</p>
      ) : (
        <ul className="list">
          {recordings.map((rec) => (
            <li
              key={rec.id}
              className="list-item"
            >
              <div style={{ fontWeight: 'bold' }}>{rec.file_name}</div>
              <div style={{ fontSize: '0.9em', color: 'var(--color-text-muted)' }}>
                {new Date(rec.created_at).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              <audio controls src={rec.url} style={{ width: '100%', marginTop: '10px' }} />

              <div className="actions" style={{ marginTop: '10px' }}>
                <button
                  className="btn danger"
                  onClick={() => handleDelete(rec)}
                >
                  🗑️ מחק קובץ
                </button>
                <button
  className="btn info"
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
        const text = result.transcription || 'לא התקבל תמלול'
        setCurrentTranscript(text);
        setCurrentId(rec.id)
        try {
          const raw = localStorage.getItem('transcripts-history')
          const list = raw ? JSON.parse(raw) : []
          const entry = { id: rec.id, fileName: rec.file_name, createdAt: rec.created_at }
          const exists = list.some((x: any) => x.id === rec.id)
          const updated = exists ? list : [entry, ...list].slice(0, 100)
          localStorage.setItem('transcripts-history', JSON.stringify(updated))
          localStorage.setItem(`transcript-${rec.id}`, text)
        } catch {}
      }
    } catch (err) {
      console.error(err);
      setCurrentTranscript('❌ שגיאה לא צפויה בתמלול');
    }
  }}
>
  לתמלול
</button>

                <button
                  className="btn"
                  onClick={() => {
                    try {
                      const text = currentId === rec.id ? currentTranscript : (localStorage.getItem(`transcript-${rec.id}`) || '')
                      if (!text) {
                        alert('אין תמלול לשמירה. בצעי תמלול תחילה.')
                        return
                      }
                      downloadTranscriptPdf(rec.file_name, text)
                    } catch {}
                  }}
                >הורדה כ-PDF</button>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyRecordingsList
