import { supabase } from '../supabaseClient'

export async function fetchSavingsGoals(userId) {
  return supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createSavingsGoal(payload) {
  return supabase.from('savings_goals').insert(payload).select().single()
}

export async function updateSavingsGoal(userId, id, fields) {
  return supabase.from('savings_goals').update(fields).eq('id', id).eq('user_id', userId).select().single()
}

export async function deleteSavingsGoal(userId, id) {
  return supabase.from('savings_goals').delete().eq('id', id).eq('user_id', userId)
}

export async function contributeToGoal(userId, id, amount) {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('saved_amount')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) return { error }

  const next = Number(data.saved_amount) + Number(amount)
  return supabase
    .from('savings_goals')
    .update({ saved_amount: next })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
}
