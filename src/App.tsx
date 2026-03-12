import { ConfigProvider, theme as antdTheme } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import CardsPage from './pages/CardsPage'
import BudgetsPage from './pages/BudgetsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import HelpsPage from './pages/HelpsPage'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { PeriodProvider } from './context/PeriodContext'
import { TransactionsProvider } from './context/TransactionsContext'

function AppShell() {
  const { themeMode } = useSettings()
  const algorithm =
    themeMode === 'dark'
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm

  return (
    <ConfigProvider
      theme={{
        algorithm,
        token: {
          colorPrimary: '#6d5efc',
          colorInfo: '#5c7cfa',
          colorSuccess: '#12b886',
          colorWarning: '#f59f00',
          colorError: '#fa5252',
          borderRadius: 16,
          fontFamily: '"Manrope", sans-serif',
        },
      }}
    >
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/helps" element={<HelpsPage />} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}

function App() {
  return (
    <SettingsProvider>
      <TransactionsProvider>
        <PeriodProvider>
          <AppShell />
        </PeriodProvider>
      </TransactionsProvider>
    </SettingsProvider>
  )
}

export default App
