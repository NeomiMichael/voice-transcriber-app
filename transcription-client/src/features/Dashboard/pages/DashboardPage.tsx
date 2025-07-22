import UploadAudioForm from '../components/UploadAudioForm'
import MyRecordingsList from '../components/MyRecordingsList'

function DashboardPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h1>🎧 ברוכה הבאה למערכת התמלול המקצועית</h1>
      <p>כאן תוכלי להעלות קובצי שמע ולקבל תמלול</p>
      <UploadAudioForm />
      <MyRecordingsList />
    </div>
  )
}

export default DashboardPage
