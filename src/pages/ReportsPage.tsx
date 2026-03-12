import { Card, Col, List, Progress, Row, Space, Statistic, Table, Typography } from 'antd'
import { useMemo } from 'react'
import { usePeriod } from '../context/PeriodContext'
import { useSettings } from '../context/SettingsContext'

function ReportsPage() {
  const { filteredTransactions, period } = usePeriod()
  const { formatCurrency } = useSettings()

  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0)
    const expense = filteredTransactions
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0)
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    }
  }, [filteredTransactions])

  const categoryRows = useMemo(() => {
    const expenseByCategory = filteredTransactions
      .filter((item) => item.amount < 0)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] ?? 0) + Math.abs(item.amount)
        return acc
      }, {})

    const totalExpense = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0)

    return Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        key: category,
        category,
        amount,
        share: totalExpense === 0 ? 0 : Math.round((amount / totalExpense) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredTransactions])

  const topExpenses = useMemo(
    () =>
      filteredTransactions
        .filter((item) => item.amount < 0)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 5),
    [filteredTransactions],
  )

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Spend',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Share',
      dataIndex: 'share',
      key: 'share',
      width: 260,
      render: (value: number) => <Progress percent={value} showInfo />,
    },
  ]

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="main-card">
        <Typography.Title level={3}>Period report: {period}</Typography.Title>
        <Typography.Paragraph>
          Metrics below are recalculated from transactions in the selected header period.
        </Typography.Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic title="Transactions" value={summary.count} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Income"
              value={summary.income}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Expense"
              value={summary.expense}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Net"
              value={summary.net}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card className="main-card" title="Spending by category">
            <Table
              columns={columns}
              dataSource={categoryRows}
              pagination={false}
              locale={{ emptyText: 'No expense data in this period.' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="main-card" title="Top expenses">
            <List
              dataSource={topExpenses}
              locale={{ emptyText: 'No expense transactions in this period.' }}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Typography.Text type="secondary">
                      {item.category} - {item.date}
                    </Typography.Text>
                  </Space>
                  <Typography.Text className="amount-out">
                    -{formatCurrency(Math.abs(item.amount))}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export default ReportsPage

