/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import type { Transaction } from '../types'
import { useTransactions } from './TransactionsContext'

export const PERIOD_OPTIONS = [
  '7 days',
  'This month',
  'This quarter',
  'Year to date',
] as const

export type PeriodOption = (typeof PERIOD_OPTIONS)[number]

type PeriodContextValue = {
  period: PeriodOption
  setPeriod: (period: PeriodOption) => void
  filteredTransactions: Transaction[]
}

const PeriodContext = createContext<PeriodContextValue | undefined>(undefined)

const MS_PER_DAY = 24 * 60 * 60 * 1000

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function getRange(period: PeriodOption, now: Date) {
  const currentDayStart = startOfDay(now)

  switch (period) {
    case '7 days':
      return {
        start: new Date(currentDayStart.getTime() - 6 * MS_PER_DAY),
        end: endOfDay(now),
      }
    case 'This month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(now),
      }
    case 'This quarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
      return {
        start: new Date(now.getFullYear(), quarterStartMonth, 1),
        end: endOfDay(now),
      }
    }
    case 'Year to date':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: endOfDay(now),
      }
  }
}

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<PeriodOption>('This month')
  const { transactions } = useTransactions()

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const { start, end } = getRange(period, now)

    return transactions
      .filter((item) => {
        const date = parseIsoDate(item.date)
        return date >= start && date <= end
      })
      .sort((a, b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime())
  }, [period, transactions])

  const value = useMemo(
    () => ({
      period,
      setPeriod,
      filteredTransactions,
    }),
    [period, filteredTransactions],
  )

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export function usePeriod() {
  const context = useContext(PeriodContext)
  if (!context) {
    throw new Error('usePeriod must be used within PeriodProvider')
  }
  return context
}
