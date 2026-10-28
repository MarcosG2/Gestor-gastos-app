export function cacheKeyCategories(userId) {
  return `categories:${userId}`
}

export function cacheKeyRecentExpenses(userId) {
  return `recentExpenses:${userId}`
}

export function cacheKeyRecentIncomes(userId) {
  return `recentIncomes:${userId}`
}

export function cacheKeyDashboardTotals(userId, start, end) {
  return `dashboardTotals:${userId}:${start}:${end}`
}
