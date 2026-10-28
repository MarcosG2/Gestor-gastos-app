import { supabase } from '../supabaseClient'

export async function fetchRecurringItems(userId) {
  return supabase
    .from('recurring_items')
    .select('*, categories(name, color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createRecurringItem(payload) {
  return supabase.from('recurring_items').insert(payload).select('*, categories(name, color)').single()
}

export async function updateRecurringItem(userId, id, fields) {
  return supabase
    .from('recurring_items')
    .update(fields)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, categories(name, color)')
    .single()
}

export async function deleteRecurringItem(userId, id) {
  return supabase.from('recurring_items').delete().eq('id', id).eq('user_id', userId)
}
