import { Badge, Button, Segmented, Space, Typography, message } from 'antd'
import { ExportOutlined, PlusOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { PERIOD_OPTIONS, usePeriod } from '../context/PeriodContext'
import type { PeriodOption } from '../context/PeriodContext'
import { useSettings } from '../context/SettingsContext'
import { exportTransactionsPdf } from '../utils/exportTransactionsPdf'

function HeaderBar() {
  const { period, setPeriod, filteredTransactions } = usePeriod()
  const { formatCurrency } = useSettings()
  const location = useLocation()
  const navigate = useNavigate()
  const isDashboard = location.pathname === '/dashboard'
  const isReports = location.pathname === '/reports'

  const headerTitle = isReports ? 'Reports & Insights' : 'Spending Dashboard'
  const headerSubtitle = isReports
    ? 'Track cash flow trends, spending categories, and export reports by period.'
    : 'Optimize your budget, track cash flow, and hit savings goals in one intuitive workspace.'
  const badgeText = isReports ? 'Period-based report center' : 'Real-time spending monitor'

  const handleExportPdf = async () => {
    const cashIn = filteredTransactions
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0)
    const cashOut = filteredTransactions
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0)

    try {
      await exportTransactionsPdf({
        rows: filteredTransactions,
        summary: {
          count: filteredTransactions.length,
          cashIn,
          cashOut,
          net: cashIn - cashOut,
        },
        formatCurrency,
        title: isReports ? 'Reports Period Transactions' : 'Dashboard Period Transactions',
        filters: { period },
      })
      message.success('PDF exported')
    } catch {
      message.error('Cannot export PDF right now')
    }
  }

  return (
    <header className="hero">
      <div>
        <Badge color="#ff6b5a" text={badgeText} />
        <Typography.Title level={1} className="hero-title">
          {headerTitle}
        </Typography.Title>
        <Typography.Paragraph className="hero-sub">
          {headerSubtitle}
        </Typography.Paragraph>
      </div>
      <Space size="middle" className="hero-actions">
        <Segmented
          options={[...PERIOD_OPTIONS]}
          value={period}
          onChange={(value) => setPeriod(value as PeriodOption)}
        />
        {isDashboard ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/transactions')}>
            Add transaction
          </Button>
        ) : null}
        <Button icon={<ExportOutlined />} onClick={handleExportPdf}>
          Export report
        </Button>
      </Space>
    </header>
  )
}

export default HeaderBar
