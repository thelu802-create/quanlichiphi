import { message } from 'antd'
import { useState } from 'react'
import type { Transaction } from '../../../types'
import { exportTransactionsPdf } from '../../../utils/exportTransactionsPdf'
import { ALL_OPTION, type TransactionSummary, type TransactionTypeFilter } from './transactionShared'

type Params = {
  rows: Transaction[]
  summary: TransactionSummary
  formatCurrency: (amount: number) => string
  title: string
  fromDate: string
  toDate: string
  type: TransactionTypeFilter
  status: string
  category: string
  searchText: string
}

export function useTransactionPdfExport(params: Params) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPdf = async () => {
    const periodLabel =
      params.fromDate || params.toDate
        ? params.fromDate && params.toDate
          ? `${params.fromDate} to ${params.toDate}`
          : params.fromDate
            ? `From ${params.fromDate}`
            : `Until ${params.toDate}`
        : 'All time'

    try {
      setIsExporting(true)
      await exportTransactionsPdf({
        rows: params.rows,
        summary: params.summary,
        formatCurrency: params.formatCurrency,
        title: params.title,
        filters: {
          period: periodLabel,
          fromDate: params.fromDate || undefined,
          toDate: params.toDate || undefined,
          type: params.type === 'all' ? undefined : params.type,
          status: params.status === ALL_OPTION ? undefined : params.status,
          category: params.category === ALL_OPTION ? undefined : params.category,
          keyword: params.searchText.trim() || undefined,
        },
      })
      message.success('PDF exported')
    } catch {
      message.error('Cannot export PDF right now')
    } finally {
      setIsExporting(false)
    }
  }

  return { isExporting, handleExportPdf }
}
