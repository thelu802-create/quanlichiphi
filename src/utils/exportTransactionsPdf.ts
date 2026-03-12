import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '../types'

type ExportSummary = {
  count: number
  cashIn: number
  cashOut: number
  net: number
}

type ExportParams = {
  rows: Transaction[]
  summary: ExportSummary
  formatCurrency: (value: number) => string
  title?: string
  filters?: {
    period?: string
    fromDate?: string
    toDate?: string
    type?: string
    status?: string
    category?: string
    keyword?: string
  }
}

function makeFilename() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `transactions-${stamp}.pdf`
}

export async function exportTransactionsPdf(params: ExportParams) {
  const { rows, summary, formatCurrency, title = 'Transactions Report', filters } = params
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const now = new Date()
  const marginLeft = 40
  const marginRight = 40
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - marginLeft - marginRight
  let cursorY = 40

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text(title, marginLeft, cursorY)

  cursorY += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text(`Generated at: ${now.toLocaleString()}`, marginLeft, cursorY)
  doc.setTextColor(15, 23, 42)

  const activeFilters = [
    ['Period', filters?.period],
    ['From', filters?.fromDate],
    ['To', filters?.toDate],
    ['Type', filters?.type],
    ['Status', filters?.status],
    ['Category', filters?.category],
    ['Keyword', filters?.keyword],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>

  if (activeFilters.length > 0) {
    cursorY += 16
    const filtersLine = activeFilters.map(([key, value]) => `${key}: ${value}`).join(' | ')
    const filterLines = doc.splitTextToSize(filtersLine, contentWidth)
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    doc.text(filterLines, marginLeft, cursorY)
    cursorY += filterLines.length * 11
    doc.setTextColor(15, 23, 42)
  }

  cursorY += 14
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginLeft, right: marginRight },
    theme: 'grid',
    headStyles: { fillColor: [248, 250, 252], textColor: [51, 65, 85], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    styles: { cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.6 },
    head: [['Transactions', 'Cash In', 'Cash Out', 'Net']],
    body: [
      [
        String(summary.count),
        formatCurrency(summary.cashIn),
        formatCurrency(summary.cashOut),
        formatCurrency(summary.net),
      ],
    ],
  })

  const tableStartY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY
  autoTable(doc, {
    startY: tableStartY + 12,
    margin: { left: marginLeft, right: marginRight },
    theme: 'grid',
    headStyles: { fillColor: [248, 250, 252], textColor: [51, 65, 85], fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    styles: { cellPadding: 6, lineColor: [226, 232, 240], lineWidth: 0.4 },
    head: [['Title', 'Category', 'Date', 'Method', 'Status', 'Amount']],
    body:
      rows.length > 0
        ? rows.map((item) => [
            item.title,
            item.category,
            item.date,
            item.method,
            item.status,
            `${item.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(item.amount))}`,
          ])
        : [['No transactions match current filters.', '', '', '', '', '']],
    columnStyles: {
      5: { halign: 'right' },
    },
  })

  const filename = makeFilename()
  const isNative = Capacitor.isNativePlatform()

  if (!isNative) {
    doc.save(filename)
    return
  }

  const dataUri = doc.output('datauristring')
  const base64 = dataUri.split(',')[1] ?? ''
  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  })
  const uri = await Filesystem.getUri({
    path: filename,
    directory: Directory.Cache,
  })
  await Share.share({
    title: 'Transactions PDF',
    text: 'Transactions export',
    url: uri.uri,
    dialogTitle: 'Export transactions PDF',
  })
}
