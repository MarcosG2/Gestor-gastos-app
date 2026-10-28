import { supabase } from '../supabaseClient'

export async function fetchProfileName(userId) {
  return supabase.from('profiles').select('full_name').eq('id', userId).single()
}

export async function updateProfileName(userId, fullName) {
  return supabase
    .from('profiles')
    .update({ full_name: fullName.trim() })
    .eq('id', userId)
}
