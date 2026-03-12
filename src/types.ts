export type TransactionStatus = 'Approved' | 'Pending'

export type TransactionRecurrence = 'none' | 'weekly' | 'monthly'

export type Transaction = {
  key: string
  title: string
  category: string
  amount: number
  date: string
  method: string
  status: TransactionStatus
  note?: string
  tags?: string[]
  attachments?: string[]
  recurrence?: TransactionRecurrence
  parentRecurringId?: string
}

export type StatItem = {
  title: string
  value: number
  trend: number
  note: string
}

export type CategorySummaryItem = {
  name: string
  amount: number
  share: number
  color: string
}

export type BudgetItem = {
  title: string
  used: number
  limit: number
  trend: string
}
