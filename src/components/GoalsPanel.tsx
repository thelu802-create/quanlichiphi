import { Button, Card, Progress, Space, Tag, Typography } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { budgets } from '../data/mock'
import { useSettings } from '../context/SettingsContext'
import { useTransactions } from '../context/TransactionsContext'

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function formatDueNote(dueDate: Date) {
  const today = startOfDay(new Date())
  const due = startOfDay(dueDate)
  const diffDays = Math.round((due.getTime() - today.getTime()) / DAY_MS)
  const dueLabel = due.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })

  if (diffDays > 0) {
    return `Due on ${dueLabel} - ${diffDays} day${diffDays > 1 ? 's' : ''} left.`
  }
  if (diffDays === 0) {
    return `Due on ${dueLabel} - due today.`
  }

  const overdueDays = Math.abs(diffDays)
  return `Due on ${dueLabel} - overdue ${overdueDays} day${overdueDays > 1 ? 's' : ''}.`
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getBudgetTrend(percent: number) {
  if (percent >= 100) return 'Over budget'
  if (percent >= 80) return 'Near limit'
  return 'On track'
}

function GoalsPanel() {
  const { formatCurrency } = useSettings()
  const { transactions } = useTransactions()
  const dueNote = formatDueNote(new Date(2026, 1, 8))

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // Budget usage is derived from current month expense transactions.
  const monthExpenses = transactions.filter((item) => {
    const date = parseIsoDate(item.date)
    return item.amount < 0 && date >= monthStart && date <= today
  })

  const usedByCategory = monthExpenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + Math.abs(item.amount)
    return acc
  }, {})

  const budgetRows = budgets.map((item) => {
    const used = usedByCategory[item.title] ?? 0
    const percent = item.limit === 0 ? 0 : Math.round((used / item.limit) * 100)
    return {
      ...item,
      used,
      percent,
      trend: getBudgetTrend(percent),
    }
  })

  const alerts = budgetRows.filter((item) => item.percent >= 80)

  return (
    <Card
      className="main-card"
      title={
        <Space>
          <ClockCircleOutlined />
          Reminders & goals
        </Space>
      }
    >
      <Space direction="vertical" size="large" className="full-width">
        <div className="alert-card">
          <Typography.Text strong>Card payment due</Typography.Text>
          <Typography.Paragraph>{dueNote}</Typography.Paragraph>
          <Button type="primary" size="small">
            Pay now
          </Button>
        </div>

        {alerts.length > 0 ? (
          <div className="budget-alert-list">
            <Typography.Text strong>Budget alerts</Typography.Text>
            <Space wrap>
              {alerts.map((item) => (
                <Tag color={item.percent >= 100 ? 'red' : 'gold'} key={item.title}>
                  {item.title}: {item.percent}%
                </Tag>
              ))}
            </Space>
          </div>
        ) : null}

        {budgetRows.map((item) => (
          <div key={item.title} className="budget-item">
            <div className="budget-header">
              <Typography.Text strong>{item.title}</Typography.Text>
              <Typography.Text type="secondary">
                {formatCurrency(item.used)} / {formatCurrency(item.limit)}
              </Typography.Text>
            </div>
            <Progress
              percent={Math.min(100, item.percent)}
              className="budget-progress"
              status={item.percent >= 100 ? 'exception' : 'normal'}
            />
            <Typography.Text className="budget-note">{item.trend}</Typography.Text>
          </div>
        ))}
      </Space>
    </Card>
  )
}

export default GoalsPanel
