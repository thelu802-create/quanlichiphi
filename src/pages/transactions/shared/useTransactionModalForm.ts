import { Form } from 'antd'
import { useState } from 'react'
import type { Transaction } from '../../../types'
import type { TransactionFormValues } from './transactionShared'

type Params = {
  addTransaction: (input: Omit<Transaction, 'key'>) => void
  updateTransaction: (key: string, input: Omit<Transaction, 'key'>) => void
}

function stringifyAttachments(values: string[] | undefined) {
  if (!values || values.length === 0) return ''
  return values.join(', ')
}

function parseAttachments(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

export function useTransactionModalForm({ addTransaction, updateTransaction }: Params) {
  const [form] = Form.useForm<TransactionFormValues>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const openCreateModal = () => {
    setEditingKey(null)
    form.setFieldsValue({
      title: '',
      category: '',
      direction: 'expense',
      amount: 0,
      date: '',
      method: '',
      status: 'Approved',
      recurrence: 'none',
      note: '',
      tags: [],
      attachmentsText: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (record: Transaction) => {
    setEditingKey(record.key)
    form.setFieldsValue({
      title: record.title,
      category: record.category,
      direction: record.amount >= 0 ? 'income' : 'expense',
      amount: Math.abs(record.amount),
      date: record.date,
      method: record.method,
      status: record.status,
      recurrence: record.recurrence ?? 'none',
      note: record.note ?? '',
      tags: record.tags ?? [],
      attachmentsText: stringifyAttachments(record.attachments),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    // Keep amount sign logic centralized to avoid web/mobile behavior drift.
    const normalizedAmount =
      values.direction === 'income' ? Math.abs(values.amount) : -Math.abs(values.amount)

    const payload = {
      title: values.title.trim(),
      category: values.category.trim(),
      amount: normalizedAmount,
      date: values.date,
      method: values.method.trim(),
      status: values.status,
      recurrence: values.recurrence,
      note: values.note.trim() || undefined,
      tags: (values.tags ?? []).map((item) => item.trim()).filter(Boolean),
      attachments: parseAttachments(values.attachmentsText || ''),
      parentRecurringId: undefined,
    }

    if (editingKey) {
      updateTransaction(editingKey, payload)
    } else {
      addTransaction(payload)
    }

    closeModal()
  }

  return {
    form,
    isModalOpen,
    editingKey,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
  }
}
