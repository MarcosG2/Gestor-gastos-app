import { supabase } from '../supabaseClient'

export async function fetchBudgetsForMonth(userId, year, month) {
  return supabase
    .from('budgets')
    .select('*, categories(id, name, color)')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
}

export async function upsertBudget(userId, { categoryId, year, month, amountLimit }) {
  const { data: existing, error: findError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  if (findError) return { error: findError }

  if (existing?.id) {
    return supabase
      .from('budgets')
      .update({ amount_limit: amountLimit })
      .eq('id', existing.id)
      .eq('user_id', userId)
  }

  return supabase.from('budgets').insert({
    user_id: userId,
    category_id: categoryId,
    year,
    month,
    amount_limit: amountLimit,
  })
}

export async function deleteBudget(userId, id) {
  return supabase.from('budgets').delete().eq('id', id).eq('user_id', userId)
}
