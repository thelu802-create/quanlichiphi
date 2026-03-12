import { Card, Segmented, Space, Switch, Typography } from 'antd'
import { useSettings } from '../context/SettingsContext'

function SettingsPage() {
  const { themeMode, setThemeMode, currency, setCurrency } = useSettings()

  return (
    <Card className="main-card">
      <Space direction="vertical" size="large" className="full-width">
        <div>
          <Typography.Title level={3}>Settings</Typography.Title>
          <Typography.Paragraph>
            Customize appearance and currency display.
          </Typography.Paragraph>
        </div>
        <div className="settings-row">
          <div className="settings-text">
            <Typography.Text strong>Dark mode</Typography.Text>
            <Typography.Text type="secondary" className="settings-hint">
              Use a low-light theme for late-night sessions.
            </Typography.Text>
          </div>
          <Switch
            checked={themeMode === 'dark'}
            onChange={(checked) =>
              setThemeMode(checked ? 'dark' : 'light')
            }
          />
        </div>
        <div className="settings-row">
          <div className="settings-text">
            <Typography.Text strong>Currency</Typography.Text>
            <Typography.Text type="secondary" className="settings-hint">
              Switch between USD and VND.
            </Typography.Text>
          </div>
          <Segmented
            options={['USD', 'VND']}
            value={currency}
            onChange={(value) => setCurrency(value as 'USD' | 'VND')}
          />
        </div>
      </Space>
    </Card>
  )
}

export default SettingsPage
