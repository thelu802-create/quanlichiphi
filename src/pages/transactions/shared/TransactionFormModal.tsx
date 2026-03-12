import { Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd'
import type { TransactionFormValues } from './transactionShared'

type Props = {
  open: boolean
  editingKey: string | null
  form: ReturnType<typeof Form.useForm<TransactionFormValues>>[0]
  onCancel: () => void
  onSubmit: () => void
  mobile: boolean
}

function TransactionFormModal({
  open,
  editingKey,
  form,
  onCancel,
  onSubmit,
  mobile,
}: Props) {
  return (
    <Modal
      title={editingKey ? 'Edit transaction' : 'Add transaction'}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={editingKey ? 'Save changes' : 'Create'}
      width={mobile ? 'calc(100vw - 24px)' : 640}
      style={mobile ? { top: 16 } : undefined}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="e.g. Grocery weekend" />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please enter category' }]}
        >
          <Input placeholder="e.g. Food & Drinks" />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} sm={mobile ? 24 : 12}>
            <Form.Item
              name="direction"
              label="Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select
                options={[
                  { label: 'Income', value: 'income' },
                  { label: 'Expense', value: 'expense' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={mobile ? 24 : 12}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber min={0} className="full-width" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} sm={mobile ? 24 : 12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={mobile ? 24 : 12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select
                options={[
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Pending', value: 'Pending' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} sm={mobile ? 24 : 12}>
            <Form.Item
              name="method"
              label="Method"
              rules={[{ required: true, message: 'Please enter method' }]}
            >
              <Input placeholder="e.g. Credit card, Bank transfer" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={mobile ? 24 : 12}>
            <Form.Item name="recurrence" label="Recurrence">
              <Select
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="tags" label="Tags">
          <Select
            mode="tags"
            placeholder="Type and press Enter"
            tokenSeparators={[',']}
            open={false}
          />
        </Form.Item>
        <Form.Item name="attachmentsText" label="Attachments">
          <Input placeholder="Comma-separated names, e.g. bill.pdf, receipt.jpg" />
        </Form.Item>
        <Form.Item name="note" label="Notes">
          <Input.TextArea rows={3} placeholder="Optional notes" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TransactionFormModal
