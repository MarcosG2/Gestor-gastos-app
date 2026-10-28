function escapeCsvCell(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildExpensesCsvContent(expenses) {
  const headers = ['Fecha', 'Categoría', 'Descripción', 'Monto']
  const rows = expenses.map((exp) => [
    exp.date?.slice(0, 10) ?? '',
    exp.categories?.name ?? '',
    exp.description ?? '',
    Number(exp.amount).toFixed(2),
  ])

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n')
}

export function downloadExpensesCsv(expenses, filename = 'gastos.csv') {
  const csv = '\ufeff' + buildExpensesCsvContent(expenses)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
