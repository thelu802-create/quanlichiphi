import { Button, Grid, Layout, Menu, Typography } from 'antd'
import {
  BankOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const { Sider } = Layout

function Sidebar() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.lg
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = location.pathname.replace('/', '') || 'dashboard'
  const menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: 'Overview' },
    { key: 'transactions', icon: <ProfileOutlined />, label: 'Transactions' },
    { key: 'cards', icon: <CreditCardOutlined />, label: 'Cards & Wallets' },
    { key: 'budgets', icon: <BankOutlined />, label: 'Budgets' },
    { key: 'reports', icon: <BarChartOutlined />, label: 'Reports' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { key: 'helps', icon: <InfoCircleOutlined />, label: 'Help' },
  ]

  if (isMobile) {
    return (
      <nav className="mobile-bottom-nav" aria-label="Primary">
        <div className="mobile-nav-scroll">
          {menuItems.map((item) => {
            const active = item.key === selectedKey
            return (
              <Button
                key={item.key}
                type="text"
                className={`mobile-nav-item${active ? ' mobile-nav-item-active' : ''}`}
                onClick={() => navigate(`/${item.key}`)}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <Sider
      width={240}
      className="sidebar"
      breakpoint="lg"
      collapsedWidth={72}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
    >
      <div className="sidebar-brand">
        <div className="brand-mark" />
        <div className="brand-text">
          <Typography.Text className="brand-title">FinMate</Typography.Text>
          <Typography.Text type="secondary" className="brand-sub">
            Personal finance
          </Typography.Text>
        </div>
        <Button
          type="text"
          className="collapse-btn"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed((prev) => !prev)}
        />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        className="sidebar-menu"
        onClick={({ key }) => navigate(`/${key}`)}
        items={menuItems}
      />
    </Sider>
  )
}

export default Sidebar
