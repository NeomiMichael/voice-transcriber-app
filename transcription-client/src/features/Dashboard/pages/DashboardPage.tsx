import { useState } from 'react'
import UploadAudioForm from '../components/UploadAudioForm'
import MyRecordingsList from '../components/MyRecordingsList'
import RecordAudio from '../../recordings/components/RecordAudio'
import HistorySidebar from '../components/HistorySidebar'

function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="title" style={{ textAlign: 'center' }}>🎧 ברוכה הבאה למערכת התמלול המקצועית</h1>
        <p className="subtitle" style={{ textAlign: 'center' }}>
          כאן תוכלי להעלות קובצי שמע או להקליט קבצים חדשים ולקבל תמלול
        </p>

        <div className="dashboard-layout">
          <HistorySidebar onSelect={(id, fileName) => {
            try {
              const text = localStorage.getItem(`transcript-${id}`) || ''
              if (!text) { alert('לא נמצא תמלול לפריט זה'); return }
              import('../../../utils/pdf').then(({ downloadTranscriptPdf }) => downloadTranscriptPdf(fileName, text))
            } catch {}
          }} />
          <div className="card">
            <RecordAudio onUploadSuccess={handleUploadSuccess} />
          </div>
          <div className="grid">
            <div className="card">
              <UploadAudioForm onUploadSuccess={handleUploadSuccess} />
            </div>
            <div className="card">
              <MyRecordingsList key={refreshKey} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
