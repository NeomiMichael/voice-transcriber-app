import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'הרשמה' : 'התחברות'}</h2>
      
      <form onSubmit={handleEmailAuth} className="auth-form">
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'טוען...' : (isSignUp ? 'הרשמה' : 'התחברות')}
        </button>
      </form>

      <button 
        onClick={handleGoogleAuth} 
        disabled={loading}
        className="google-auth-btn"
      >
        התחברות עם Google
      </button>

      <p>
        {isSignUp ? 'יש לך כבר חשבון?' : 'אין לך חשבון?'}{' '}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="link-btn"
        >
          {isSignUp ? 'התחברות' : 'הרשמה'}
        </button>
      </p>
    </div>
  )
} 