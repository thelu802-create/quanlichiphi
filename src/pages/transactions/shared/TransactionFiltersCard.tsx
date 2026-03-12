import { Button, Card, Col, Input, Row, Select, Space } from 'antd'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { FilterPreset, TransactionSortOption, TransactionTypeFilter } from './transactionShared'
import { ALL_OPTION } from './transactionShared'

type Props = {
  searchText: string
  setSearchText: (value: string) => void
  type: TransactionTypeFilter
  setType: (value: TransactionTypeFilter) => void
  status: string
  setStatus: (value: string) => void
  category: string
  setCategory: (value: string) => void
  categoryOptions: Array<{ label: string; value: string }>
  fromDate: string
  setFromDate: (value: string) => void
  toDate: string
  setToDate: (value: string) => void
  sortBy: TransactionSortOption
  setSortBy: (value: TransactionSortOption) => void
  presets: FilterPreset[]
  saveCurrentPreset: (name: string) => void
  applyPreset: (id: string) => void
  deletePreset: (id: string) => void
  resetFilters: () => void
  onFilterChange?: () => void
  isMobile: boolean
  extra?: ReactNode
}

function TransactionFiltersCard({
  searchText,
  setSearchText,
  type,
  setType,
  status,
  setStatus,
  category,
  setCategory,
  categoryOptions,
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
  resetFilters,
  onFilterChange,
  isMobile,
  extra,
}: Props) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined)

  // Use one wrapper so any filter mutation can trigger shared side effects (e.g. reset page).
  const applyFilterChange = (action: () => void) => {
    action()
    onFilterChange?.()
  }

  const handleSavePreset = () => {
    const name = window.prompt('Preset name')
    if (!name) return
    saveCurrentPreset(name)
  }

  const handleApplyPreset = (value: string) => {
    setSelectedPresetId(value)
    applyFilterChange(() => applyPreset(value))
  }

  const handleDeletePreset = () => {
    if (!selectedPresetId) return
    deletePreset(selectedPresetId)
    setSelectedPresetId(undefined)
  }

  return (
    <Card className="main-card" title="Filters" extra={isMobile ? null : extra}>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12} lg={8}>
          <Input
            placeholder="Search title, category, method, note"
            value={searchText}
            onChange={(event) => applyFilterChange(() => setSearchText(event.target.value))}
          />
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Select
            className="full-width"
            value={type}
            options={[
              { label: 'All types', value: 'all' },
              { label: 'Income', value: 'income' },
              { label: 'Expense', value: 'expense' },
            ]}
            onChange={(value) => applyFilterChange(() => setType(value))}
          />
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Select
            className="full-width"
            value={status}
            options={[
              { label: 'All status', value: ALL_OPTION },
              { label: 'Approved', value: 'Approved' },
              { label: 'Pending', value: 'Pending' },
            ]}
            onChange={(value) => applyFilterChange(() => setStatus(value))}
          />
        </Col>
        <Col xs={24} md={12} lg={4}>
          <Select
            className="full-width"
            value={category}
            options={categoryOptions}
            onChange={(value) => applyFilterChange(() => setCategory(value))}
          />
        </Col>
        <Col xs={12} md={6} lg={2}>
          <Input
            type="date"
            value={fromDate}
            onChange={(event) => applyFilterChange(() => setFromDate(event.target.value))}
          />
        </Col>
        <Col xs={12} md={6} lg={2}>
          <Input
            type="date"
            value={toDate}
            onChange={(event) => applyFilterChange(() => setToDate(event.target.value))}
          />
        </Col>
        <Col xs={24} md={8} lg={6}>
          <Select
            className="full-width"
            value={sortBy}
            options={[
              { label: 'Newest first', value: 'date_desc' },
              { label: 'Oldest first', value: 'date_asc' },
              { label: 'Amount high to low', value: 'amount_desc' },
              { label: 'Amount low to high', value: 'amount_asc' },
            ]}
            onChange={(value) => applyFilterChange(() => setSortBy(value))}
          />
        </Col>
        <Col xs={24} md={16} lg={18}>
          <Space wrap>
            <Select
              className="preset-select"
              placeholder="Saved presets"
              value={selectedPresetId}
              options={presets.map((item) => ({ label: item.name, value: item.id }))}
              onChange={handleApplyPreset}
              allowClear
              onClear={() => setSelectedPresetId(undefined)}
            />
            <Button onClick={handleSavePreset}>Save preset</Button>
            <Button danger disabled={!selectedPresetId} onClick={handleDeletePreset}>
              Delete preset
            </Button>
            <Button
              className={isMobile ? 'full-width' : undefined}
              onClick={() => applyFilterChange(resetFilters)}
            >
              Reset filters
            </Button>
          </Space>
        </Col>
      </Row>
      {isMobile && extra ? <div className="mobile-filter-actions">{extra}</div> : null}
    </Card>
  )
}

export default TransactionFiltersCard
