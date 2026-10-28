import { supabase } from '../supabaseClient'

export async function fetchRecentIncomes(userId, limit = 5) {
  return supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function sumIncomesInRange(userId, start, end) {
  const { data, error } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)

  if (error) return { total: 0, error }

  const total = (data || []).reduce((acc, row) => acc + Number(row.amount), 0)
  return { total, error: null }
}

export async function createIncome(payload) {
  return supabase.from('incomes').insert(payload).select().single()
}

export async function updateIncome(userId, id, payload) {
  return supabase.from('incomes').update(payload).eq('id', id).eq('user_id', userId)
}

export async function deleteIncome(userId, id) {
  return supabase.from('incomes').delete().eq('id', id).eq('user_id', userId)
}
