import type { Transaction, TransactionRecurrence } from '../types'

type CsvRow = Omit<Transaction, 'key'>

const CSV_HEADERS = [
  'title',
  'category',
  'amount',
  'date',
  'method',
  'status',
  'recurrence',
  'note',
  'tags',
  'attachments',
] as const

function escapeCsvCell(value: string) {
  const needsQuote = value.includes(',') || value.includes('"') || value.includes('\n')
  const escaped = value.replaceAll('"', '""')
  return needsQuote ? `"${escaped}"` : escaped
}

function parseCsvLine(line: string) {
  const output: string[] = []
  let current = ''
  let inQuote = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuote && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuote = !inQuote
      continue
    }

    if (char === ',' && !inQuote) {
      output.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  output.push(current.trim())
  return output
}

function cleanList(value: string) {
  if (!value) return []
  return Array.from(
    new Set(
      value
        .split('|')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

function normalizeRecurrence(value: string): TransactionRecurrence {
  if (value === 'weekly' || value === 'monthly') return value
  return 'none'
}

export function transactionsToCsv(rows: Transaction[]) {
  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((item) =>
      [
        item.title,
        item.category,
        String(item.amount),
        item.date,
        item.method,
        item.status,
        item.recurrence ?? 'none',
        item.note ?? '',
        (item.tags ?? []).join('|'),
        (item.attachments ?? []).join('|'),
      ]
        .map(escapeCsvCell)
        .join(','),
    ),
  ]

  return lines.join('\n')
}

export function csvToTransactionInputs(rawCsv: string): CsvRow[] {
  const lines = rawCsv
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
  if (lines.length <= 1) return []

  const content = lines.slice(1)
  const rows: CsvRow[] = []

  content.forEach((line) => {
    const cols = parseCsvLine(line)
    if (cols.length < 6) return

    const amount = Number(cols[2])
    if (!Number.isFinite(amount)) return

    rows.push({
      title: cols[0] ?? '',
      category: cols[1] ?? '',
      amount,
      date: cols[3] ?? '',
      method: cols[4] ?? '',
      status: cols[5] === 'Pending' ? 'Pending' : 'Approved',
      recurrence: normalizeRecurrence(cols[6] ?? ''),
      note: (cols[7] ?? '').trim() || undefined,
      tags: cleanList(cols[8] ?? ''),
      attachments: cleanList(cols[9] ?? ''),
      parentRecurringId: undefined,
    })
  })

  return rows
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function parseTransactionsBackup(rawJson: string): Transaction[] {
  const parsed = JSON.parse(rawJson)
  if (!Array.isArray(parsed)) return []
  return parsed.filter(
    (item) =>
      item &&
      typeof item.key === 'string' &&
      typeof item.title === 'string' &&
      typeof item.category === 'string' &&
      typeof item.amount === 'number' &&
      typeof item.date === 'string' &&
      typeof item.method === 'string' &&
      (item.status === 'Approved' || item.status === 'Pending'),
  )
}
