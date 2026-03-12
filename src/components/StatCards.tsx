import { useMemo } from 'react'
import { Card, Col, Row, Statistic, Tag, Typography } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { useSettings } from '../context/SettingsContext'
import { usePeriod } from '../context/PeriodContext'
import type { PeriodOption } from '../context/PeriodContext'
import { useTransactions } from '../context/TransactionsContext'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  )
}

function getCurrentRange(period: PeriodOption, now: Date) {
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

function getPreviousRange(period: PeriodOption, now: Date) {
  const currentRange = getCurrentRange(period, now)
  const duration = currentRange.end.getTime() - currentRange.start.getTime()
  const end = new Date(currentRange.start.getTime() - 1)
  const start = new Date(end.getTime() - duration)
  return { start, end }
}

function summarize(list: { amount: number }[]) {
  const cashIn = list
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)
  const cashOut = list
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0)
  return {
    cashIn,
    cashOut,
    savings: cashIn - cashOut,
    totalSpend: cashOut,
  }
}

function calcTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return current > 0 ? 100 : -100
  }
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1))
}

function getCompareNote(period: PeriodOption) {
  switch (period) {
    case '7 days':
      return 'vs previous 7 days'
    case 'This month':
      return 'vs same span last month'
    case 'This quarter':
      return 'vs same span last quarter'
    case 'Year to date':
      return 'vs same span last year'
  }
}

function StatCards() {
  const { formatCurrency } = useSettings()
  const { filteredTransactions, period } = usePeriod()
  const { transactions } = useTransactions()
  const compareNote = getCompareNote(period)

  const stats = useMemo(() => {
    const now = new Date()
    const previousRange = getPreviousRange(period, now)
    const previousTransactions = transactions.filter((item) => {
      const date = parseIsoDate(item.date)
      return date >= previousRange.start && date <= previousRange.end
    })

    const current = summarize(filteredTransactions)
    const previous = summarize(previousTransactions)

    return [
      {
        title: `Total Spend (${period})`,
        value: current.totalSpend,
        trend: calcTrend(current.totalSpend, previous.totalSpend),
        note: compareNote,
      },
      {
        title: 'Cash In',
        value: current.cashIn,
        trend: calcTrend(current.cashIn, previous.cashIn),
        note: compareNote,
      },
      {
        title: 'Cash Out',
        value: current.cashOut,
        trend: calcTrend(current.cashOut, previous.cashOut),
        note: compareNote,
      },
      {
        title: 'Savings',
        value: current.savings,
        trend: calcTrend(current.savings, previous.savings),
        note: compareNote,
      },
    ]
  }, [filteredTransactions, transactions, period, compareNote])

  return (
    <Row gutter={[20, 20]}>
      {stats.map((item) => (
        <Col xs={24} sm={12} lg={6} key={item.title}>
          <Card className="stat-card">
            <div className="stat-header">
              <Typography.Text type="secondary">{item.title}</Typography.Text>
              <Tag color={item.trend >= 0 ? 'green' : 'red'}>
                {item.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(item.trend)}%
              </Tag>
            </div>
            <Statistic
              value={item.value}
              valueStyle={{ fontSize: 26 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Typography.Text className="stat-note">{item.note}</Typography.Text>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default StatCards
