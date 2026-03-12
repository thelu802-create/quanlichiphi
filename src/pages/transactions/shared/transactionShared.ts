import type { Transaction, TransactionRecurrence } from '../../../types'

export const ALL_OPTION = 'all'

export type TransactionTypeFilter = 'all' | 'income' | 'expense'

export type TransactionSortOption =
  | 'date_desc'
  | 'date_asc'
  | 'amount_desc'
  | 'amount_asc'

export type FilterPreset = {
  id: string
  name: string
  searchText: string
  category: string
  status: string
  type: TransactionTypeFilter
  fromDate: string
  toDate: string
  sortBy: TransactionSortOption
}

export type TransactionFormValues = {
  title: string
  category: string
  direction: 'income' | 'expense'
  amount: number
  date: string
  method: string
  status: Transaction['status']
  recurrence: TransactionRecurrence
  note: string
  tags: string[]
  attachmentsText: string
}

export type TransactionSummary = {
  count: number
  cashIn: number
  cashOut: number
  net: number
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
