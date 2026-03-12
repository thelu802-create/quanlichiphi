/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { transactions as seedTransactions } from '../data/mock'
import type { Transaction, TransactionRecurrence } from '../types'

const STORAGE_KEY = 'testreact.transactions.v1'

type TransactionInput = Omit<Transaction, 'key'>

type TransactionsContextValue = {
  transactions: Transaction[]
  addTransaction: (input: TransactionInput) => void
  addTransactions: (inputs: TransactionInput[]) => void
  updateTransaction: (key: string, input: TransactionInput) => void
  deleteTransaction: (key: string) => void
  deleteTransactions: (keys: string[]) => void
  restoreTransactions: (rows: Transaction[]) => void
  duplicateTransaction: (key: string) => void
  replaceTransactions: (rows: Transaction[]) => void
  getTransactionsByKeys: (keys: string[]) => Transaction[]
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined)

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatIsoDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function addInterval(date: Date, recurrence: TransactionRecurrence) {
  if (recurrence === 'weekly') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
  }
  return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanStringList(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map(cleanString).filter(Boolean)))
}

function normalizeRecurrence(value: unknown): TransactionRecurrence {
  if (value === 'weekly' || value === 'monthly') return value
  return 'none'
}

function normalizeTransaction(raw: Transaction): Transaction {
  return {
    ...raw,
    title: cleanString(raw.title),
    category: cleanString(raw.category),
    method: cleanString(raw.method),
    note: cleanString(raw.note) || undefined,
    tags: cleanStringList(raw.tags),
    attachments: cleanStringList(raw.attachments),
    recurrence: normalizeRecurrence(raw.recurrence),
    parentRecurringId: cleanString(raw.parentRecurringId) || undefined,
  }
}

function isValidTransaction(raw: unknown): raw is Transaction {
  const item = raw as Transaction
  return Boolean(
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

function sortByDateDesc(rows: Transaction[]) {
  return [...rows].sort((a, b) => {
    const delta = parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime()
    if (delta !== 0) return delta
    return a.key.localeCompare(b.key)
  })
}

function expandRecurringTransactions(rows: Transaction[]) {
  const today = startOfDay(new Date())
  const existingSignatures = new Set(rows.map((item) => `${item.parentRecurringId ?? item.key}|${item.date}`))
  const generated: Transaction[] = []

  rows.forEach((item) => {
    const recurrence = item.recurrence ?? 'none'
    if (item.parentRecurringId || recurrence === 'none') return

    let cursor = addInterval(parseIsoDate(item.date), recurrence)
    while (startOfDay(cursor) <= today) {
      const isoDate = formatIsoDate(cursor)
      const signature = `${item.key}|${isoDate}`
      if (!existingSignatures.has(signature)) {
        generated.push({
          ...item,
          key: `${item.key}::${isoDate}`,
          date: isoDate,
          recurrence: 'none',
          parentRecurringId: item.key,
        })
        existingSignatures.add(signature)
      }
      cursor = addInterval(cursor, recurrence)
    }
  })

  return generated.length > 0 ? [...rows, ...generated] : rows
}

function normalizeTransactions(rows: Transaction[]) {
  return rows.map((item) => normalizeTransaction(item))
}

function hydrateTransactions(rows: Transaction[]) {
  return sortByDateDesc(expandRecurringTransactions(normalizeTransactions(rows)))
}

function parseStoredTransactions(value: string | null): Transaction[] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return null
    if (!parsed.every(isValidTransaction)) return null
    return hydrateTransactions(parsed)
  } catch {
    return null
  }
}

function nextKey(rows: Transaction[]) {
  return String(rows.reduce((max, item) => Math.max(max, Number(item.key) || 0), 0) + 1)
}

function normalizeInput(input: TransactionInput): TransactionInput {
  return {
    ...input,
    title: cleanString(input.title),
    category: cleanString(input.category),
    method: cleanString(input.method),
    note: cleanString(input.note) || undefined,
    tags: cleanStringList(input.tags),
    attachments: cleanStringList(input.attachments),
    recurrence: normalizeRecurrence(input.recurrence),
    parentRecurringId: cleanString(input.parentRecurringId) || undefined,
  }
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = parseStoredTransactions(localStorage.getItem(STORAGE_KEY))
    return stored ?? hydrateTransactions(seedTransactions)
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      addTransaction: (input: TransactionInput) => {
        setTransactions((prev) =>
          hydrateTransactions([{ key: nextKey(prev), ...normalizeInput(input) }, ...prev]),
        )
      },
      addTransactions: (inputs: TransactionInput[]) => {
        if (inputs.length === 0) return
        setTransactions((prev) => {
          let keySeed = Number(nextKey(prev)) || 1
          const nextRows = inputs.map((input) => {
            const key = String(keySeed)
            keySeed += 1
            return { key, ...normalizeInput(input) }
          })
          return hydrateTransactions([...nextRows, ...prev])
        })
      },
      updateTransaction: (key: string, input: TransactionInput) => {
        setTransactions((prev) => {
          const target = prev.find((item) => item.key === key)
          if (!target) return prev

          // If root recurring rule changes, rebuild generated children for this rule.
          const withoutGeneratedChildren = target.parentRecurringId
            ? prev
            : prev.filter((item) => item.parentRecurringId !== key)

          return hydrateTransactions(
            withoutGeneratedChildren.map((item) =>
              item.key === key ? { key, ...normalizeInput(input) } : item,
            ),
          )
        })
      },
      deleteTransaction: (key: string) => {
        setTransactions((prev) =>
          hydrateTransactions(
            prev.filter((item) => item.key !== key && item.parentRecurringId !== key),
          ),
        )
      },
      deleteTransactions: (keys: string[]) => {
        const deleting = new Set(keys)
        setTransactions((prev) =>
          hydrateTransactions(
            prev.filter(
              (item) => !deleting.has(item.key) && !deleting.has(item.parentRecurringId ?? ''),
            ),
          ),
        )
      },
      restoreTransactions: (rows: Transaction[]) => {
        if (rows.length === 0) return
        setTransactions((prev) => {
          const existing = new Set(prev.map((item) => item.key))
          const restored = rows.filter((item) => !existing.has(item.key))
          return hydrateTransactions([...restored, ...prev])
        })
      },
      duplicateTransaction: (key: string) => {
        setTransactions((prev) => {
          const target = prev.find((item) => item.key === key)
          if (!target) return prev
          const copy: Transaction = {
            ...target,
            key: nextKey(prev),
            title: `${target.title} (copy)`,
            recurrence: 'none',
            parentRecurringId: undefined,
          }
          return hydrateTransactions([copy, ...prev])
        })
      },
      replaceTransactions: (rows: Transaction[]) => {
        setTransactions(hydrateTransactions(rows))
      },
      getTransactionsByKeys: (keys: string[]) => {
        const lookup = new Set(keys)
        return transactions.filter((item) => lookup.has(item.key))
      },
    }),
    [transactions],
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactions must be used within TransactionsProvider')
  }
  return context
}
