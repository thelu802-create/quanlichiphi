import { Col, Row } from 'antd'
import StatCards from '../components/StatCards'
import SpendingOverview from '../components/SpendingOverview'
import GoalsPanel from '../components/GoalsPanel'
import QuickAddForm from '../components/QuickAddForm'
import RecentTransactions from '../components/RecentTransactions'

function DashboardPage() {
  return (
    <>
      <StatCards />
      <Row gutter={[20, 20]} className="grid-row">
        <Col xs={24} lg={14}>
          <SpendingOverview />
        </Col>
        <Col xs={24} lg={10}>
          <GoalsPanel />
        </Col>
      </Row>
      <Row gutter={[20, 20]} className="grid-row">
        <Col xs={24} lg={8}>
          <QuickAddForm />
        </Col>
        <Col xs={24} lg={16}>
          <RecentTransactions />
        </Col>
      </Row>
    </>
  )
}

export default DashboardPage
