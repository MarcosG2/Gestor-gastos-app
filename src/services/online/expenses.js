import { supabase } from '../../supabaseClient'

function expensesQuery(userId) {
  return supabase
    .from('expenses')
    .select('*, categories(*)')
    .eq('user_id', userId)
}

export async function fetchRecentExpenses(userId, limit = 10) {
  return expensesQuery(userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function fetchExpensesPage(userId, { page, pageSize, categoryId, dateFrom, dateTo }) {
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('expenses')
    .select('*, categories(*)', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (categoryId) query = query.eq('category_id', categoryId)
  if (dateFrom) query = query.gte('date', dateFrom)
  if (dateTo) query = query.lte('date', dateTo)

  return query.range(from, to)
}

export async function fetchExpensesInRange(userId, start, end) {
  return supabase
    .from('expenses')
    .select('amount, date, category_id, categories(name, color)')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
}

export async function sumExpensesInRange(userId, start, end) {
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)

  if (error) return { total: 0, error }

  const total = (data || []).reduce((acc, row) => acc + Number(row.amount), 0)
  return { total, error: null }
}

export async function createExpense(payload) {
  return supabase.from('expenses').insert(payload).select().single()
}

export async function updateExpense(userId, id, payload) {
  return supabase.from('expenses').update(payload).eq('id', id).eq('user_id', userId)
}

export async function deleteExpense(userId, id) {
  return supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
}

export async function fetchExpensesForExport(userId, { categoryId, dateFrom, dateTo }) {
  let query = supabase
    .from('expenses')
    .select('*, categories(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5000)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (dateFrom) query = query.gte('date', dateFrom)
  if (dateTo) query = query.lte('date', dateTo)

  return query
}

export async function expenseExistsForRecurring(userId, recurringItemId, start, end) {
  return supabase
    .from('expenses')
    .select('id')
    .eq('user_id', userId)
    .eq('recurring_item_id', recurringItemId)
    .gte('date', start)
    .lte('date', end)
    .maybeSingle()
}
