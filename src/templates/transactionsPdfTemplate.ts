import type { Transaction } from '../types'

type ExportSummary = {
  count: number
  cashIn: number
  cashOut: number
  net: number
}

type ExportFilters = {
  period?: string
  fromDate?: string
  toDate?: string
  type?: string
  status?: string
  category?: string
  keyword?: string
}

type TemplateParams = {
  title: string
  generatedAt: string
  summary: ExportSummary
  rows: Transaction[]
  filters?: ExportFilters
  formatCurrency: (value: number) => string
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderFilter(label: string, value?: string) {
  if (!value) return ''
  return `<span class="pill"><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</span>`
}

export function createTransactionsPdfHtml(params: TemplateParams) {
  const { title, generatedAt, summary, rows, filters, formatCurrency } = params
  const rowsHtml =
    rows.length === 0
      ? `
        <tr>
          <td class="empty" colspan="6">No transactions match current filters.</td>
        </tr>
      `
      : rows
          .map((item) => {
            const amount = `${item.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(item.amount))}`
            const amountClass = item.amount < 0 ? 'neg' : 'pos'
            return `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.category)}</td>
          <td>${escapeHtml(item.date)}</td>
          <td>${escapeHtml(item.method)}</td>
          <td>${escapeHtml(item.status)}</td>
          <td class="amount ${amountClass}">${escapeHtml(amount)}</td>
        </tr>
      `
          })
          .join('')

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        width: 760px;
        font-family: Arial, Helvetica, sans-serif;
        color: #0f172a;
        background: #ffffff;
      }
      .header {
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px;
        margin-bottom: 14px;
        background: linear-gradient(135deg, #f8fafc, #eef2ff);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 22px;
      }
      .sub {
        color: #475569;
        font-size: 12px;
      }
      .pill-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }
      .pill {
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 11px;
        color: #334155;
        background: #ffffff;
      }
      .summary {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 14px;
      }
      .box {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 10px;
        background: #ffffff;
      }
      .k {
        margin: 0 0 6px;
        color: #64748b;
        font-size: 11px;
      }
      .v {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e2e8f0;
      }
      thead th {
        background: #f8fafc;
        color: #334155;
        text-align: left;
        font-size: 11px;
        padding: 8px;
        border-bottom: 1px solid #e2e8f0;
      }
      tbody td {
        font-size: 11px;
        padding: 8px;
        border-bottom: 1px solid #f1f5f9;
        color: #1e293b;
      }
      .empty {
        text-align: center;
        color: #64748b;
        font-style: italic;
        padding: 16px 8px;
      }
      .amount { text-align: right; font-weight: 700; }
      .amount.pos { color: #059669; }
      .amount.neg { color: #dc2626; }
    </style>
  </head>
  <body>
    <section class="header">
      <h1>${escapeHtml(title)}</h1>
      <div class="sub">Generated at: ${escapeHtml(generatedAt)}</div>
      <div class="pill-wrap">
        ${renderFilter('Period', filters?.period)}
        ${renderFilter('From', filters?.fromDate)}
        ${renderFilter('To', filters?.toDate)}
        ${renderFilter('Type', filters?.type)}
        ${renderFilter('Status', filters?.status)}
        ${renderFilter('Category', filters?.category)}
        ${renderFilter('Keyword', filters?.keyword)}
      </div>
    </section>

    <section class="summary">
      <div class="box"><p class="k">Transactions</p><p class="v">${summary.count}</p></div>
      <div class="box"><p class="k">Cash In</p><p class="v">${escapeHtml(formatCurrency(summary.cashIn))}</p></div>
      <div class="box"><p class="k">Cash Out</p><p class="v">${escapeHtml(formatCurrency(summary.cashOut))}</p></div>
      <div class="box"><p class="k">Net</p><p class="v">${escapeHtml(formatCurrency(summary.net))}</p></div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Date</th>
          <th>Method</th>
          <th>Status</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </body>
</html>
  `
}
