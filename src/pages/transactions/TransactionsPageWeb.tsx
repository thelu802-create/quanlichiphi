import { useRef, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Grid,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
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

function TransactionsPageWeb() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { formatCurrency } = useSettings()
  const {
    transactions: rows,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    restoreTransactions,
    duplicateTransaction,
    replaceTransactions,
  } = useTransactions()

  const csvInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null)

  const filters = useTransactionFilters(rows)
  const modal = useTransactionModalForm({ addTransaction, updateTransaction })
  const { isExporting, handleExportPdf } = useTransactionPdfExport({
    rows: filters.filteredTransactions,
    summary: filters.summary,
    formatCurrency,
    title: 'Transactions Report',
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    type: filters.type,
    status: filters.status,
    category: filters.category,
    searchText: filters.searchText,
  })

  const totalPages = Math.max(1, Math.ceil(filters.filteredTransactions.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const showUndoDeleteMessage = (deletedRows: Transaction[]) => {
    if (deletedRows.length === 0) return
    const key = `undo-${Date.now()}`
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
    setSelectedKeys((prev) => prev.filter((item) => item !== key))
    showUndoDeleteMessage(deletedRows)
  }

  const handleDeleteSelected = () => {
    const deleting = new Set(selectedKeys.map(String))
    const deletedRows = rows.filter(
      (item) => deleting.has(item.key) || deleting.has(item.parentRecurringId ?? ''),
    )
    deleteTransactions(selectedKeys.map(String))
    setSelectedKeys([])
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
      setSelectedKeys([])
      message.success('Backup restored')
    } catch {
      message.error('Cannot restore backup file')
    }
  }

  // Keep all filter changes on page 1 to avoid empty table on high page index.
  const handleFilterChange = () => setPage(1)

  const columns = [
    {
      title: 'Transaction',
      dataIndex: 'title',
      key: 'title',
      render: (value: string, record: Transaction) => (
        <div>
          <div className="tx-title">{value}</div>
          <div className="tx-category">{record.category}</div>
          {isMobile ? (
            <div className="tx-meta">
              <span>{record.date}</span>
              <span>{record.method}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      responsive: ['lg' as const],
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 150,
      responsive: ['lg' as const],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      responsive: ['md' as const],
      render: (value: Transaction['status']) => (
        <Tag color={value === 'Approved' ? 'green' : 'gold'}>{value}</Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (value: number) => (
        <span className={value < 0 ? 'amount-out' : 'amount-in'}>
          {value < 0 ? '-' : '+'}
          {formatCurrency(Math.abs(value))}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 320,
      render: (_: unknown, record: Transaction) => (
        <Space size="small" wrap>
          <Button type="link" onClick={() => handleOpenDetails(record)}>
            Details
          </Button>
          <Button type="link" onClick={() => duplicateTransaction(record.key)}>
            Duplicate
          </Button>
          <Button type="link" onClick={() => modal.openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this transaction?"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filterActions = (
    <Space wrap className="filter-actions">
      <Button type="primary" onClick={modal.openCreateModal}>
        Add transaction
      </Button>
      <Button onClick={handleExportPdf} loading={isExporting}>
        Export PDF
      </Button>
      <Button onClick={handleExportCsv}>Export CSV</Button>
      <Button onClick={handleImportCsvClick}>Import CSV</Button>
      <Button onClick={handleBackupJson}>Backup JSON</Button>
      <Button onClick={handleRestoreJsonClick}>Restore JSON</Button>
      <Popconfirm
        title={`Delete ${selectedKeys.length} selected transactions?`}
        okText="Delete"
        cancelText="Cancel"
        disabled={selectedKeys.length === 0}
        onConfirm={handleDeleteSelected}
      >
        <Button danger disabled={selectedKeys.length === 0}>
          Delete selected
        </Button>
      </Popconfirm>
    </Space>
  )

  return (
    <Space direction="vertical" size={20} className="full-width">
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

      <Card className="main-card">
        <Typography.Title level={isMobile ? 4 : 3}>Transactions</Typography.Title>
        <Typography.Paragraph>
          Search, filter, and review all cash movements in one place.
        </Typography.Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic title="Transactions" value={filters.summary.count} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Cash In"
              value={filters.summary.cashIn}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Cash Out"
              value={filters.summary.cashOut}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Net"
              value={filters.summary.net}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
        </Row>
      </Card>

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
        onFilterChange={handleFilterChange}
        isMobile={isMobile}
        extra={filterActions}
      />

      <Card className="main-card" title="All transactions">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={filters.filteredTransactions}
          size={isMobile ? 'small' : 'middle'}
          scroll={isMobile ? { x: 980 } : undefined}
          rowSelection={
            isMobile
              ? undefined
              : {
                  selectedRowKeys: selectedKeys,
                  onChange: (keys) => setSelectedKeys(keys),
                }
          }
          pagination={{
            current: currentPage,
            pageSize,
            total: filters.filteredTransactions.length,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            pageSizeOptions: [5, 8, 10, 20],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage)
              setPageSize(nextSize)
            },
          }}
        />
      </Card>

      <TransactionFormModal
        open={modal.isModalOpen}
        editingKey={modal.editingKey}
        form={modal.form}
        onCancel={modal.closeModal}
        onSubmit={modal.handleSubmit}
        mobile={isMobile}
      />

      <TransactionDetailsDrawer
        open={detailsOpen}
        transaction={activeTransaction}
        onClose={() => setDetailsOpen(false)}
      />
    </Space>
  )
}

export default TransactionsPageWeb
