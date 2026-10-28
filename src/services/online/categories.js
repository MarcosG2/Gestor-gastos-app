import { supabase } from '../../supabaseClient'

export async function fetchCategories(userId) {
  return supabase.from('categories').select('*').eq('user_id', userId).order('name')
}

export async function createCategory(userId, name, color) {
  return supabase.from('categories').insert({
    name: name.trim(),
    color,
    user_id: userId,
  })
}

export async function deleteCategoryAndExpenses(userId, categoryId) {
  const { error: expError } = await supabase
    .from('expenses')
    .delete()
    .eq('category_id', categoryId)
    .eq('user_id', userId)

  if (expError) return { error: expError }

  return supabase.from('categories').delete().eq('id', categoryId).eq('user_id', userId)
}
