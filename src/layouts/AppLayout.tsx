import { Layout, Space } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import HeaderBar from '../components/HeaderBar'
import '../App.css'

function AppLayout() {
  const location = useLocation()
  const showHeader = location.pathname === '/dashboard' || location.pathname === '/reports'

  return (
    <Layout className="layout">
      <Sidebar />
      <Layout className="layout-content">
        {showHeader ? <HeaderBar /> : null}
        <div className="app">
          <Space direction="vertical" size={20} className="section-stack">
            <Outlet />
          </Space>
        </div>
      </Layout>
    </Layout>
  )
}

export default AppLayout
