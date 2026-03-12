/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark'
type Currency = 'USD' | 'VND'

const USD_TO_VND = 24000

type SettingsContextValue = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [currency, setCurrency] = useState<Currency>('USD')

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      const normalized = currency === 'VND' ? amount * USD_TO_VND : amount
      const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
      }
      if (currency === 'VND') {
        options.maximumFractionDigits = 0
      }
      return new Intl.NumberFormat('en-US', options).format(normalized)
    }
  }, [currency])

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      currency,
      setCurrency,
      formatCurrency,
    }),
    [themeMode, currency, formatCurrency],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
