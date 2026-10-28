export function formatDateInput(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** monthIndex: 0 = enero */
export function monthDateBounds(year, monthIndex) {
  const month = String(monthIndex + 1).padStart(2, '0')
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const endDay = String(lastDay).padStart(2, '0')
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${endDay}`,
  }
}

export function parseExpenseDate(expense) {
  if (expense.date) return expense.date.slice(0, 10)
  if (expense.created_at) return formatDateInput(new Date(expense.created_at))
  return formatDateInput()
}
