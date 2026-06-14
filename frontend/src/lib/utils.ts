import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    SENT: 'status-sent',
    DELIVERED: 'status-delivered',
    OPENED: 'status-opened',
    CLICKED: 'status-clicked',
    CONVERTED: 'status-converted',
    FAILED: 'status-failed',
    DRAFT: 'status-draft',
    SENDING: 'status-sending',
    COMPLETED: 'status-completed',
  }
  return map[status?.toUpperCase()] || 'status-draft'
}

export function getChannelColor(channel: string): string {
  const map: Record<string, string> = {
    whatsapp: 'channel-whatsapp',
    email: 'channel-email',
    sms: 'channel-sms',
    rcs: 'channel-rcs',
  }
  return map[channel?.toLowerCase()] || 'channel-email'
}
