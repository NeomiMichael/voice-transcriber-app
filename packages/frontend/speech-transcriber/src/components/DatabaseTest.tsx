import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DatabaseTest() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const testConnection = async () => {
    setLoading(true)
    setMessage('בודק חיבור...')
    
    try {
      // בדיקת חיבור בסיסית
      const { error } = await supabase.from('transcripts').select('count').limit(1)
      
      if (error) {
        if (error.code === '42P01') {
          setMessage('טבלת transcripts לא קיימת. יוצר טבלה...')
          await createTables()
        } else {
          setMessage(`שגיאה: ${error.message}`)
        }
      } else {
        setMessage('החיבור עובד! טבלת transcripts קיימת.')
      }
    } catch (error: any) {
      setMessage(`שגיאה: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    try {
      // יצירת טבלת transcripts
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS transcripts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            file_name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            transcript_text TEXT,
            status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'done', 'failed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            duration_seconds INTEGER,
            language VARCHAR(10)
          );
        `
      })

      if (error) {
        // אם RPC לא עובד, ננסה דרך SQL Editor
        setMessage('אנא צרי את הטבלה ידנית ב-SQL Editor:')
        setMessage(`
          CREATE TABLE transcripts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            file_name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            transcript_text TEXT,
            status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'done', 'failed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            duration_seconds INTEGER,
            language VARCHAR(10)
          );
        `)
      } else {
        setMessage('טבלת transcripts נוצרה בהצלחה!')
      }
    } catch (error: any) {
      setMessage(`שגיאה ביצירת טבלה: ${error.message}`)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    setMessage('בודק authentication...')
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setMessage(`שגיאת auth: ${error.message}`)
      } else if (user) {
        setMessage(`מחובר: ${user.email}`)
      } else {
        setMessage('לא מחובר')
      }
    } catch (error: any) {
      setMessage(`שגיאה: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="database-test">
      <h3>בדיקת חיבור ל-Supabase</h3>
      
      <div className="test-buttons">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="test-btn"
        >
          בדוק חיבור Database
        </button>
        
        <button 
          onClick={testAuth}
          disabled={loading}
          className="test-btn"
        >
          בדוק Authentication
        </button>
      </div>

      {message && (
        <div className="message">
          <pre>{message}</pre>
        </div>
      )}
    </div>
  )
} 