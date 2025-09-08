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
        <div className="card" style={{ textAlign: 'center' }}>
            <div className="form">
                <input
                    className="input"
                    type="email"
                    placeholder="אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="input"
                    type="password"
                    placeholder="סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn" onClick={handleLogin}>התחבר</button>
            </div>

            {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
            {success && <p style={{ color: 'var(--color-success)' }}>{success}</p>}
            <p style={{ marginTop: '15px' }}>
                אין לך חשבון?
                <Link to="/register" style={{ marginRight: '5px' }}>להרשמה</Link>
            </p>
        </div>
    )
}

export default LoginForm
