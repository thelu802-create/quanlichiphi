import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Typography,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useTransactions } from '../context/TransactionsContext'

const CATEGORY_OPTIONS = [
  { value: 'Food & Drinks', label: 'Food & Drinks' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Home', label: 'Home' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Other', label: 'Other' },
]

function todayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function QuickAddForm() {
  const { currency } = useSettings()
  const { addTransaction } = useTransactions()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [type, setType] = useState<'in' | 'out' | undefined>(undefined)
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [date, setDate] = useState(todayIsoDate())

  const canSave = useMemo(
    () =>
      title.trim().length > 0 &&
      (amount ?? 0) > 0 &&
      Boolean(type) &&
      Boolean(category) &&
      Boolean(date),
    [title, amount, type, category, date],
  )

  const handleSave = () => {
    if (!canSave || !type || !category || !amount) {
      message.warning('Please complete all fields')
      return
    }

    addTransaction({
      title: title.trim(),
      category,
      amount: type === 'in' ? Math.abs(amount) : -Math.abs(amount),
      date,
      method: 'Quick add',
      status: 'Approved',
    })
    setTitle('')
    setAmount(null)
    setType(undefined)
    setCategory(undefined)
    setDate(todayIsoDate())
    message.success('Transaction saved')
  }

  return (
    <Card className="main-card" title="Quick add transaction">
      <Space direction="vertical" size="middle" className="full-width">
        <Input
          placeholder="Transaction note"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <InputNumber
              min={0}
              className="full-width"
              placeholder={`Amount (${currency})`}
              value={amount}
              onChange={(value) => setAmount(value)}
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder="Type"
              value={type}
              options={[
                { value: 'in', label: 'Income' },
                { value: 'out', label: 'Expense' },
              ]}
              onChange={(value) => setType(value)}
            />
          </Col>
        </Row>
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Select
              placeholder="Category"
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(value) => setCategory(value)}
            />
          </Col>
          <Col span={12}>
            <Input
              type="date"
              className="full-width"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Col>
        </Row>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleSave}
          disabled={!canSave}
        >
          Save transaction
        </Button>
      </Space>
      <Divider />
      <Space direction="vertical" size="small">
        <Typography.Text type="secondary">Saving tip</Typography.Text>
        <Typography.Text>
          Set spending limits per category to avoid budget overrun.
        </Typography.Text>
      </Space>
    </Card>
  )
}

export default QuickAddForm
