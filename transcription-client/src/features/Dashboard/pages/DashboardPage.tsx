import UploadAudioForm from '../components/UploadAudioForm'
import LogoutButton from '../components/LogoutButton'

function DashboardPage() {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1> 🎧ברוכה הבאה למערכת התמלול המקצועית</h1>
        <p>כאן תוכלי להעלות קובצי שמע ולקבל תמלול</p>
        <UploadAudioForm />
        <LogoutButton />
      </div>
    )
  }
  
  
  export default DashboardPage
  