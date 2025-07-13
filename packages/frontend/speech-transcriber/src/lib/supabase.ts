import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfprpgixrxacelcqhlamz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcnBnaXhyeGFjZWxjcWhsYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ4MzIsImV4cCI6MjA2NzQ3MDgzMn0.vtdeJT8Aig57TtSIlfoC0RRouDIRsBb0-PvEjcbmVHs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  created_at: string
}

export interface Transcript {
  id: string
  user_id: string
  file_name: string
  display_name: string
  transcript_text: string
  status: 'uploaded' | 'processing' | 'done' | 'failed'
  created_at: string
  duration_seconds?: number
  language?: string
} 