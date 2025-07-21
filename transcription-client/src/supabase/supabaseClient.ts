import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfrpgixrxacelcqhlamz.supabase.co' // ← תחליפי ב־URL שלך
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcnBnaXhyeGFjZWxjcWhsYW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTQ4MzIsImV4cCI6MjA2NzQ3MDgzMn0.vtdeJT8Aig57TtSIlfoC0RRouDIRsBb0-PvEjcbmVHs' // ← תחליפי ב־anon key שלך

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
