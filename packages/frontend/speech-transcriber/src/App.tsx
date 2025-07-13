import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import Auth from './components/Auth'
import AudioRecorder from './components/AudioRecorder'
import DatabaseTest from './components/DatabaseTest'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="loading">טוען...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>מערכת תמלול קול</h1>
        {user && (
          <div className="user-info">
            <span>שלום, {user.email}</span>
            <button onClick={handleSignOut} className="sign-out-btn">
              התנתקות
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!user ? (
          <div className="auth-section">
            <Auth />
            <DatabaseTest />
          </div>
        ) : (
          <div className="dashboard">
            <AudioRecorder />
            {/* כאן נוסיף את רשימת התמלולים בהמשך */}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
