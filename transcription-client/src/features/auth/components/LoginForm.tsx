import { useState } from 'react'
import { loginUser } from '../authApi'
import { Link } from 'react-router-dom'


function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleLogin = async () => {
        setError('')
        setSuccess('')
        const { error } = await loginUser(email, password)

        if (error) {
            setError(error.message)
        } else {
            setSuccess('התחברת בהצלחה!')
        }
    }

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
            <h2>התחברות</h2>
            <input
                type="email"
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ display: 'block', marginBottom: '10px', width: '100%' }}
            />
            <input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ display: 'block', marginBottom: '10px', width: '100%' }}
            />
            <button onClick={handleLogin}>התחבר</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <p style={{ marginTop: '15px' }}>
                אין לך חשבון?
                <Link to="/register" style={{ marginLeft: '5px' }}>להרשמה</Link>
            </p>
        </div>
    )
}

export default LoginForm
