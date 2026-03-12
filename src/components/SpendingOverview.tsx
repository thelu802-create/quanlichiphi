import { Card, List, Progress, Space, Typography } from 'antd'
import { RadarChartOutlined } from '@ant-design/icons'
import { useSettings } from '../context/SettingsContext'
import { usePeriod } from '../context/PeriodContext'

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drinks': '#ff6b5a',
  Transport: '#ffb020',
  Home: '#6d5efc',
  Entertainment: '#13c2c2',
  Shopping: '#2f54eb',
  Other: '#7a7a7a',
}

function SpendingOverview() {
  const { formatCurrency } = useSettings()
  const { filteredTransactions, period } = usePeriod()
  const expenseItems = filteredTransactions.filter((item) => item.amount < 0)

  const totalSpend = expenseItems.reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const categoryAmountMap = expenseItems.reduce<Record<string, number>>((acc, item) => {
    const name = item.category === 'Income' ? 'Other' : item.category
    acc[name] = (acc[name] ?? 0) + Math.abs(item.amount)
    return acc
  }, {})

  const categorySummary = Object.entries(categoryAmountMap)
    .map(([name, amount]) => ({
      name,
      amount,
      share: totalSpend === 0 ? 0 : Math.round((amount / totalSpend) * 100),
      color: CATEGORY_COLORS[name] ?? CATEGORY_COLORS.Other,
    }))
    .sort((a, b) => b.amount - a.amount)

  return (
    <Card
      className="main-card"
      title={
        <Space>
          <RadarChartOutlined />
          Spending breakdown ({period})
        </Space>
      }
      extra={<Typography.Text type="secondary">Updated to today</Typography.Text>}
    >
      <div className="overview-grid">
        <div className="chart-ring">
          <div className="chart-inner">
            <Typography.Text type="secondary">Total spend</Typography.Text>
            <Typography.Title level={3}>{formatCurrency(totalSpend)}</Typography.Title>
            <Typography.Text className="trend-up">
              {categorySummary.length} categories
            </Typography.Text>
          </div>
        </div>
        <List
          dataSource={categorySummary}
          renderItem={(item) => (
            <List.Item className="category-item">
              <Space>
                <span className="dot" style={{ background: item.color }} />
                <div>
                  <div className="category-name">{item.name}</div>
                  <div className="category-value">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </Space>
              <Progress
                percent={item.share}
                strokeColor={item.color}
                showInfo={false}
              />
            </List.Item>
          )}
        />
      </div>
    </Card>
  )
}

export default SpendingOverview
