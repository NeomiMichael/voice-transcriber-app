import { useState } from 'react'
import UploadAudioForm from '../components/UploadAudioForm'
import MyRecordingsList from '../components/MyRecordingsList'
import RecordAudio from '../../recordings/components/RecordAudio'

function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>🎧 ברוכה הבאה למערכת התמלול המקצועית</h1>
      <p style={{ textAlign: 'center' }}>
        כאן תוכלי להעלות קובצי שמע או להקליט קבצים חדשים ולקבל תמלול
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: '40px',
          alignItems: 'flex-start',
          marginTop: '40px',
        }}
      >
        {/* צד ימין – הקלטת שמע */}
        <div style={{ flex: 1 }}>
<RecordAudio onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* צד שמאל – העלאה ורשימה */}
        <div style={{ flex: 2 }}>
          <UploadAudioForm onUploadSuccess={handleUploadSuccess} />
          <MyRecordingsList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
