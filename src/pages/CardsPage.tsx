import { Card, Typography } from 'antd'

function CardsPage() {
  return (
    <Card className="main-card">
      <Typography.Title level={3}>Cards & Wallets</Typography.Title>
      <Typography.Paragraph>
        Manage cards, e-wallets, and linked banks.
      </Typography.Paragraph>
    </Card>
  )
}

export default CardsPage
