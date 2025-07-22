import { useState } from 'react'
import UploadAudioForm from '../components/UploadAudioForm'
import MyRecordingsList from '../components/MyRecordingsList'

function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h1>🎧 ברוכה הבאה למערכת התמלול המקצועית</h1>
      <p>כאן תוכלי להעלות קובצי שמע ולקבל תמלול</p>

      {/* שולחת את הפונקציה לתוך UploadAudioForm */}
      <UploadAudioForm onUploadSuccess={handleUploadSuccess} />

      {/* מייצרת מפתח חדש כל פעם שמתרחשת העלאה */}
      <MyRecordingsList key={refreshKey} />
    </div>
  )
}

export default DashboardPage
