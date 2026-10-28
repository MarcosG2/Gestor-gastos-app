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

export async function fetchAccountStats(userId) {
  const base = (table) =>
    supabase.from(table).select('*', { count: 'exact', head: true }).eq('user_id', userId)

  const [expenses, categories, incomes, budgets] = await Promise.all([
    base('expenses'),
    base('categories'),
    base('incomes'),
    base('budgets'),
  ])

  const error = expenses.error || categories.error || incomes.error || budgets.error

  return {
    data: {
      expenses: expenses.count ?? 0,
      categories: categories.count ?? 0,
      incomes: incomes.count ?? 0,
      budgets: budgets.count ?? 0,
    },
    error,
  }
}

/** Borra movimientos y categorías; mantiene la cuenta de auth y el perfil. */
export async function resetUserFinancialData(userId) {
  const tables = ['expenses', 'incomes', 'budgets', 'categories']
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) return { error }
  }
  return { error: null }
}
