import { Drawer, Space, Tag, Typography } from 'antd'
import type { Transaction } from '../../../types'

type Props = {
  open: boolean
  transaction: Transaction | null
  onClose: () => void
}

function TransactionDetailsDrawer({ open, transaction, onClose }: Props) {
  return (
    <Drawer
      title={transaction ? `Transaction details: ${transaction.title}` : 'Transaction details'}
      open={open}
      onClose={onClose}
      width={420}
    >
      {!transaction ? null : (
        <Space direction="vertical" size="middle" className="full-width">
          <div>
            <Typography.Text type="secondary">Category</Typography.Text>
            <Typography.Paragraph>{transaction.category}</Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">Method</Typography.Text>
            <Typography.Paragraph>{transaction.method}</Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">Date</Typography.Text>
            <Typography.Paragraph>{transaction.date}</Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">Recurrence</Typography.Text>
            <Typography.Paragraph>{transaction.recurrence ?? 'none'}</Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">Tags</Typography.Text>
            <div className="tx-drawer-tags">
              {(transaction.tags ?? []).length === 0 ? (
                <Typography.Text type="secondary">No tags</Typography.Text>
              ) : (
                (transaction.tags ?? []).map((item) => <Tag key={item}>{item}</Tag>)
              )}
            </div>
          </div>
          <div>
            <Typography.Text type="secondary">Attachments</Typography.Text>
            <Space direction="vertical" size={4} className="full-width">
              {(transaction.attachments ?? []).length === 0 ? (
                <Typography.Text type="secondary">No attachments</Typography.Text>
              ) : (
                (transaction.attachments ?? []).map((item) => (
                  <Typography.Text key={item}>{item}</Typography.Text>
                ))
              )}
            </Space>
          </div>
          <div>
            <Typography.Text type="secondary">Notes</Typography.Text>
            <Typography.Paragraph>
              {transaction.note?.trim() ? transaction.note : 'No notes'}
            </Typography.Paragraph>
          </div>
        </Space>
      )}
    </Drawer>
  )
}

export default TransactionDetailsDrawer
