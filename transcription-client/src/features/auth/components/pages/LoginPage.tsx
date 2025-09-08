import { useUser } from '../../../../contexts/UserContext'
import LoginForm from '../LoginForm'
import { logoutUser } from '../../authApi'

function LoginPage() {
  const { user } = useUser()

  const handleLogout = async () => {
    await logoutUser()
  }
  return (
    <div className="page">
      <div className="container auth-wrapper">
      {user ? (
        <>
          <h2>ברוכה הבאה, {user.email}!</h2>
          <button className="btn ghost" onClick={handleLogout}>התנתקות</button>
        </>
      ) : (
        <>
          <h2 className="title" style={{ textAlign: 'center' }}>התחברי למערכת</h2>
          <LoginForm />
        </>
      )}
      </div>
    </div>
  )
}

export default LoginPage
