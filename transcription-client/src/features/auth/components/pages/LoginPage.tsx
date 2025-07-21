import { useUser } from '../../../../contexts/UserContext'
import LoginForm from '../LoginForm'
import { logoutUser } from '../../authApi'

function LoginPage() {
  const { user } = useUser()

  const handleLogout = async () => {
    await logoutUser()
  }
  return (
    <div>
      {user ? (
        <>
          <h2>ברוכה הבאה, {user.email}!</h2>
          <button onClick={handleLogout}>התנתקות</button>
        </>
      ) : (
        <>
          <h2>התחברי למערכת</h2>
          <LoginForm />
        </>
      )}
    </div>
  )
}

export default LoginPage
