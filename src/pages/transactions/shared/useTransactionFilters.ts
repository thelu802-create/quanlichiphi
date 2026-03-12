import { useEffect, useMemo, useState } from 'react'
import type { Transaction } from '../../../types'
import {
  ALL_OPTION,
  parseIsoDate,
  type FilterPreset,
  type TransactionSortOption,
  type TransactionSummary,
  type TransactionTypeFilter,
} from './transactionShared'

const PRESET_STORAGE_KEY = 'testreact.transaction-filter-presets.v1'

function parsePresetList(value: string | null): FilterPreset[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.searchText === 'string' &&
        typeof item.category === 'string' &&
        typeof item.status === 'string' &&
        typeof item.type === 'string' &&
        typeof item.fromDate === 'string' &&
        typeof item.toDate === 'string' &&
        typeof item.sortBy === 'string',
    )
  } catch {
    return []
  }
}

export function useTransactionFilters(rows: Transaction[]) {
  const [searchText, setSearchText] = useState('')
  const [category, setCategory] = useState(ALL_OPTION)
  const [status, setStatus] = useState(ALL_OPTION)
  const [type, setType] = useState<TransactionTypeFilter>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortBy, setSortBy] = useState<TransactionSortOption>('date_desc')
  const [presets, setPresets] = useState<FilterPreset[]>(() =>
    parsePresetList(localStorage.getItem(PRESET_STORAGE_KEY)),
  )

  useEffect(() => {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets))
  }, [presets])

  const categoryOptions = useMemo(
    () => [
      { label: 'All categories', value: ALL_OPTION },
      ...Array.from(new Set(rows.map((item) => item.category))).map((item) => ({
        label: item,
        value: item,
      })),
    ],
    [rows],
  )

  const filteredTransactions = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    const from = fromDate ? parseIsoDate(fromDate).getTime() : null
    // Include full day for the end date so date boundaries match user expectation.
    const to = toDate
      ? new Date(
          parseIsoDate(toDate).getFullYear(),
          parseIsoDate(toDate).getMonth(),
          parseIsoDate(toDate).getDate(),
          23,
          59,
          59,
          999,
        ).getTime()
      : null

    return rows
      .filter((item) => {
        if (query) {
          const target = `${item.title} ${item.category} ${item.method} ${item.note ?? ''}`
            .toLowerCase()
            .trim()
          if (!target.includes(query)) return false
        }

        if (category !== ALL_OPTION && item.category !== category) return false
        if (status !== ALL_OPTION && item.status !== status) return false
        if (type === 'income' && item.amount <= 0) return false
        if (type === 'expense' && item.amount >= 0) return false

        const time = parseIsoDate(item.date).getTime()
        if (from !== null && time < from) return false
        if (to !== null && time > to) return false
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date_asc':
            return parseIsoDate(a.date).getTime() - parseIsoDate(b.date).getTime()
          case 'amount_desc':
            return Math.abs(b.amount) - Math.abs(a.amount)
          case 'amount_asc':
            return Math.abs(a.amount) - Math.abs(b.amount)
          case 'date_desc':
          default:
            return parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime()
        }
      })
  }, [rows, searchText, category, status, type, fromDate, toDate, sortBy])

  const summary = useMemo<TransactionSummary>(() => {
    const cashIn = filteredTransactions
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0)
    const cashOut = filteredTransactions
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0)

    return {
      count: filteredTransactions.length,
      cashIn,
      cashOut,
      net: cashIn - cashOut,
    }
  }, [filteredTransactions])

  const resetFilters = () => {
    setSearchText('')
    setCategory(ALL_OPTION)
    setStatus(ALL_OPTION)
    setType('all')
    setFromDate('')
    setToDate('')
    setSortBy('date_desc')
  }

  const saveCurrentPreset = (name: string) => {
    const normalized = name.trim()
    if (!normalized) return

    const nextPreset: FilterPreset = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: normalized,
      searchText,
      category,
      status,
      type,
      fromDate,
      toDate,
      sortBy,
    }

    setPresets((prev) => [nextPreset, ...prev])
  }

  const applyPreset = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId)
    if (!preset) return

    setSearchText(preset.searchText)
    setCategory(preset.category)
    setStatus(preset.status)
    setType(preset.type)
    setFromDate(preset.fromDate)
    setToDate(preset.toDate)
    setSortBy(preset.sortBy)
  }

  const deletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((item) => item.id !== presetId))
  }

  return {
    searchText,
    setSearchText,
    category,
    setCategory,
    status,
    setStatus,
    type,
    setType,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sortBy,
    setSortBy,
    presets,
    saveCurrentPreset,
    applyPreset,
    deletePreset,
    categoryOptions,
    filteredTransactions,
    summary,
    resetFilters,
  }
}
