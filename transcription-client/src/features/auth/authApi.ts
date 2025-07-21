import { supabase } from '../../supabase/supabaseClient'

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}
export async function logoutUser() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }
  
