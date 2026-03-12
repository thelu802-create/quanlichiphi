import { Card, Typography } from 'antd'

function BudgetsPage() {
  return (
    <Card className="main-card">
      <Typography.Title level={3}>Budgets</Typography.Title>
      <Typography.Paragraph>
        Set limits and track category spend.
      </Typography.Paragraph>
    </Card>
  )
}

export default BudgetsPage
