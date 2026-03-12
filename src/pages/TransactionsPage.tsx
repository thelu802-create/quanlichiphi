import { Grid } from 'antd'
import TransactionsPageMobile from './transactions/TransactionsPageMobile'
import TransactionsPageWeb from './transactions/TransactionsPageWeb'

function TransactionsPage() {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.lg

  if (isMobile) return <TransactionsPageMobile />
  return <TransactionsPageWeb />
}

export default TransactionsPage
