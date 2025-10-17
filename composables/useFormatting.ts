// composables/useFormatting.ts
import { ref, computed } from 'vue'
import {
  formatPhoneNumber,
  createWhatsAppLink,
  formatTimezone,
} from '@/utils/formatters'

export function useFormatting() {
  const currentTime = ref(new Date())

  // Update time every minute if on client side
  if (process.client) {
    setInterval(() => {
      currentTime.value = new Date()
    }, 60000)
  }

  // File and Upload related formatters
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 0) return 'Almost done...'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s left`
  }

  const formatViewCount = (count: number): string => {
    if (count === 0) return '0 views'
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M views`
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K views`
    }
    return `${count} views`
  }

  const formatUploadSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
    return (
      parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    )
  }

  const formatProgress = (value: number): string => {
    return `${Math.round(value)}%`
  }

  const formatUploadTime = (startTime: number, endTime: number): string => {
    const duration = (endTime - startTime) / 1000 // Convert to seconds
    return formatTime(duration)
  }

  // Contact related formatters
  const formatters = {
    phone: formatPhoneNumber,
    whatsApp: createWhatsAppLink,
    timezone: (tz: string) => formatTimezone(tz),
  }

  const getCurrentTime = computed(() => {
    return (timezone: string) => formatTimezone(timezone)
  })

  // Date and time formatters
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: Date | string): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Currency formatter
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return {
    // File and Upload formatters
    formatFileSize,
    formatTime,
    formatViewCount,
    formatUploadSpeed,
    formatProgress,
    formatUploadTime,

    // Contact formatters
    formatters,
    getCurrentTime,

    // Date and time formatters
    formatDate,
    formatDateTime,

    // Currency formatter
    formatCurrency,

    // Expose current time ref if needed
    currentTime,
  }
}
