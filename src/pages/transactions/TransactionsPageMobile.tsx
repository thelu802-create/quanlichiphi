import { useRef, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Empty,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from 'antd'
import type { Transaction } from '../../types'
import { useSettings } from '../../context/SettingsContext'
import { useTransactions } from '../../context/TransactionsContext'
import {
  csvToTransactionInputs,
  downloadTextFile,
  parseTransactionsBackup,
  transactionsToCsv,
} from '../../utils/transactionTransfer'
import TransactionDetailsDrawer from './shared/TransactionDetailsDrawer'
import TransactionFormModal from './shared/TransactionFormModal'
import TransactionFiltersCard from './shared/TransactionFiltersCard'
import { useTransactionFilters } from './shared/useTransactionFilters'
import { useTransactionModalForm } from './shared/useTransactionModalForm'
import { useTransactionPdfExport } from './shared/useTransactionPdfExport'

function TransactionsPageMobile() {
  const { formatCurrency } = useSettings()
  const {
    transactions: rows,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    restoreTransactions,
    duplicateTransaction,
    replaceTransactions,
  } = useTransactions()

  const csvInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null)

  const filters = useTransactionFilters(rows)
  const modal = useTransactionModalForm({ addTransaction, updateTransaction })
  const { isExporting, handleExportPdf } = useTransactionPdfExport({
    rows: filters.filteredTransactions,
    summary: filters.summary,
    formatCurrency,
    title: 'Transactions Report (Mobile)',
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    type: filters.type,
    status: filters.status,
    category: filters.category,
    searchText: filters.searchText,
  })

  const showUndoDeleteMessage = (deletedRows: Transaction[]) => {
    if (deletedRows.length === 0) return
    const key = `undo-mobile-${Date.now()}`
    message.open({
      key,
      duration: 8,
      content: (
        <Space>
          <span>Transaction deleted.</span>
          <Button
            type="link"
            onClick={() => {
              restoreTransactions(deletedRows)
              message.destroy(key)
            }}
          >
            Undo
          </Button>
        </Space>
      ),
    })
  }

  const handleDelete = (key: string) => {
    const deletedRows = rows.filter((item) => item.key === key || item.parentRecurringId === key)
    deleteTransaction(key)
    showUndoDeleteMessage(deletedRows)
  }

  const handleOpenDetails = (transaction: Transaction) => {
    setActiveTransaction(transaction)
    setDetailsOpen(true)
  }

  const handleExportCsv = () => {
    const csv = transactionsToCsv(filters.filteredTransactions)
    downloadTextFile('transactions-export.csv', csv, 'text/csv;charset=utf-8;')
    message.success('CSV exported')
  }

  const handleBackupJson = () => {
    const json = JSON.stringify(rows, null, 2)
    downloadTextFile('transactions-backup.json', json, 'application/json;charset=utf-8;')
    message.success('Backup saved')
  }

  const handleImportCsvClick = () => csvInputRef.current?.click()
  const handleRestoreJsonClick = () => jsonInputRef.current?.click()

  const handleImportCsvFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const imported = csvToTransactionInputs(text)
      if (imported.length === 0) {
        message.warning('No valid rows found in CSV')
        return
      }
      addTransactions(imported)
      message.success(`${imported.length} transaction(s) imported`)
    } catch {
      message.error('Cannot import CSV file')
    }
  }

  const handleRestoreJsonFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const restored = parseTransactionsBackup(text)
      if (restored.length === 0 && !window.confirm('Backup is empty or invalid. Clear all data?')) {
        return
      }
      if (!window.confirm('Replace current transactions with this backup?')) return

      replaceTransactions(restored)
      message.success('Backup restored')
    } catch {
      message.error('Cannot restore backup file')
    }
  }

  return (
    <Space direction="vertical" size={14} className="full-width">
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden-input"
        onChange={handleImportCsvFile}
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden-input"
        onChange={handleRestoreJsonFile}
      />

      <TransactionFiltersCard
        searchText={filters.searchText}
        setSearchText={filters.setSearchText}
        type={filters.type}
        setType={filters.setType}
        status={filters.status}
        setStatus={filters.setStatus}
        category={filters.category}
        setCategory={filters.setCategory}
        categoryOptions={filters.categoryOptions}
        fromDate={filters.fromDate}
        setFromDate={filters.setFromDate}
        toDate={filters.toDate}
        setToDate={filters.setToDate}
        sortBy={filters.sortBy}
        setSortBy={filters.setSortBy}
        presets={filters.presets}
        saveCurrentPreset={filters.saveCurrentPreset}
        applyPreset={filters.applyPreset}
        deletePreset={filters.deletePreset}
        resetFilters={filters.resetFilters}
        isMobile
        extra={
          <Space wrap>
            <Button type="primary" onClick={modal.openCreateModal}>
              Add
            </Button>
            <Button onClick={handleExportPdf} loading={isExporting}>
              PDF
            </Button>
            <Button onClick={handleExportCsv}>CSV</Button>
            <Button onClick={handleImportCsvClick}>Import</Button>
            <Button onClick={handleBackupJson}>Backup</Button>
            <Button onClick={handleRestoreJsonClick}>Restore</Button>
          </Space>
        }
      />

      <Row gutter={[10, 10]}>
        <Col span={12}>
          <Card className="main-card mobile-summary-card">
            <Statistic title="Transactions" value={filters.summary.count} />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="main-card mobile-summary-card">
            <Statistic
              title="Net"
              value={filters.summary.net}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="main-card mobile-summary-card">
            <Statistic
              title="Cash In"
              value={filters.summary.cashIn}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="main-card mobile-summary-card">
            <Statistic
              title="Cash Out"
              value={filters.summary.cashOut}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      <Card className="main-card" title={`All transactions (${filters.filteredTransactions.length})`}>
        {filters.filteredTransactions.length === 0 ? (
          <Empty description="No transactions match filters" />
        ) : (
          <Space direction="vertical" size={10} className="full-width">
            {filters.filteredTransactions.map((item) => (
              <Card key={item.key} className="mobile-tx-card">
                <div className="mobile-tx-head">
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Typography.Text className={item.amount < 0 ? 'amount-out' : 'amount-in'}>
                    {item.amount < 0 ? '-' : '+'}
                    {formatCurrency(Math.abs(item.amount))}
                  </Typography.Text>
                </div>
                <div className="mobile-tx-meta">
                  <span>{item.category}</span>
                  <span>{item.date}</span>
                </div>
                <div className="mobile-tx-meta">
                  <span>{item.method}</span>
                  <Tag color={item.status === 'Approved' ? 'green' : 'gold'}>{item.status}</Tag>
                </div>
                <Space size="small" wrap>
                  <Button type="link" onClick={() => handleOpenDetails(item)}>
                    Details
                  </Button>
                  <Button type="link" onClick={() => duplicateTransaction(item.key)}>
                    Duplicate
                  </Button>
                  <Button type="link" onClick={() => modal.openEditModal(item)}>
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this transaction?"
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDelete(item.key)}
                  >
                    <Button type="link" danger>
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      <TransactionFormModal
        open={modal.isModalOpen}
        editingKey={modal.editingKey}
        form={modal.form}
        onCancel={modal.closeModal}
        onSubmit={modal.handleSubmit}
        mobile
      />

      <TransactionDetailsDrawer
        open={detailsOpen}
        transaction={activeTransaction}
        onClose={() => setDetailsOpen(false)}
      />
    </Space>
  )
}

export default TransactionsPageMobile
