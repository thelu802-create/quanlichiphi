import { Button, Card, Empty, Grid, List, Space, Table, Tag, Typography } from 'antd'
import type { Transaction } from '../types'
import { useSettings } from '../context/SettingsContext'
import { usePeriod } from '../context/PeriodContext'

const columns = (formatCurrency: (amount: number) => string) => [
  {
    title: 'Transaction',
    dataIndex: 'title',
    key: 'title',
    render: (value: string, record: Transaction) => (
      <div>
        <div className="tx-title">{value}</div>
        <div className="tx-category">{record.category}</div>
      </div>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: 120,
  },
  {
    title: 'Method',
    dataIndex: 'method',
    key: 'method',
    width: 150,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 140,
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
]

function RecentTransactions() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const { formatCurrency } = useSettings()
  const { filteredTransactions, period } = usePeriod()

  return (
    <Card
      className="main-card"
      title="Recent transactions"
      extra={
        <Button type="link">
          {period}: {filteredTransactions.length} items
        </Button>
      }
    >
      {isMobile ? (
        filteredTransactions.length === 0 ? (
          <Empty description="No transactions" />
        ) : (
          <List
            className="recent-mobile-list"
            dataSource={filteredTransactions}
            renderItem={(item) => (
              <List.Item className="recent-mobile-item">
                <Space direction="vertical" size={6} className="full-width">
                  <div className="recent-mobile-head">
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
                </Space>
              </List.Item>
            )}
          />
        )
      ) : (
        <Table
          columns={columns(formatCurrency)}
          dataSource={filteredTransactions}
          pagination={false}
        />
      )}
    </Card>
  )
}

export default RecentTransactions
