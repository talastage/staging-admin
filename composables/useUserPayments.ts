import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Project } from '@/types/project'

// Types
export interface User {
  id: number
  username?: string
  display_name: string
  profile_photo: string
}

export interface Payment {
  reference: string
  amount: string
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded'
  payment_type:
    | 'tip'
    | 'project_tip'
    | 'project_watching'
    | 'project_premiering'
  created_at: string
  processed_at: string | null
  currency: {
    code: string
    symbol: string
  }
  payment_method: {
    id: number
    name: string
    logo_url: string | null
  }
  order: {
    reference: string
    status: string
    order_type: string
    total_amount: string
    completed_at: string
  }
  recipient?: User // For single tip (legacy)
  recipients?: User[] // For multiple tips
  project?: Project // For single project (legacy)
  projects?: Project[] // For multiple projects
}

export interface PaymentListResponse {
  payments: {
    data: Payment[]
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface PaymentDetailResponse {
  success: boolean
  payment: Payment
}

/**
 * Composable for fetching user payment history and payment details
 */
export function useUserPayments() {
  const { $axios } = useNuxtApp()
  const route = useRoute()

  // Shared state
  const payments = ref<Payment[]>([])
  const currentPayment = ref<Payment | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)

  // Helper functions for formatting and display
  const getStatusColor = (status: Payment['status']): string => {
    const colors: Record<Payment['status'], string> = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
      cancelled: 'error',
      refunded: 'error',
    }
    return colors[status] || 'grey'
  }

  const getStatusIcon = (status: Payment['status']): string => {
    const icons: Record<Payment['status'], string> = {
      pending: 'mdi-clock-outline',
      processing: 'mdi-progress-clock',
      completed: 'mdi-check-circle',
      failed: 'mdi-alert-circle',
      cancelled: 'mdi-cancel',
      refunded: 'mdi-cash-refund',
    }
    return icons[status] || 'mdi-help-circle'
  }

  const getPaymentTypeTitle = (type: Payment['payment_type']): string => {
    const titles: Record<Payment['payment_type'], string> = {
      tip: 'Tip Payment',
      project_tip: 'Project Tip',
      project_watching: 'Project Purchase',
      project_premiering: 'Project Premiere',
    }
    return titles[type] || 'Payment'
  }

  const getRecipientTitle = (type: Payment['payment_type']): string => {
    const titles: Record<Payment['payment_type'], string> = {
      tip: 'Tipped User',
      project_tip: 'Tipped Project',
      project_watching: 'Purchased Projects',
      project_premiering: 'Premiering Projects',
    }
    return titles[type] || 'Details'
  }

  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Project payment types
  const projectPaymentTypes = computed(() => [
    'project_tip',
    'project_watching',
    'project_premiering',
  ])

  // Function to fetch payment history
  const fetchPayments = async (page: number = 1) => {
    try {
      loading.value = true
      const { data } = await $axios.get<PaymentListResponse>(
        '/api/user/payments',
        {
          params: { page },
        }
      )

      if (page === 1) {
        payments.value = data.payments.data
      } else {
        payments.value = [...payments.value, ...data.payments.data]
      }

      hasMore.value = page < data.meta.last_page
      error.value = null
    } catch (err) {
      console.error('Error fetching payments:', err)
      error.value = 'Unable to fetch payment history. Please try again later.'
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  // Function to fetch a specific payment detail
  const fetchPaymentDetail = async (reference: string) => {
    try {
      loading.value = true
      error.value = null

      // Clean the reference (remove 'payment-' prefix if present)
      const cleanReference = reference.toString().replace('payment-', '')

      const { data } = await $axios.get<PaymentDetailResponse>(
        `/api/user/payments/${cleanReference}`
      )

      if (data.success) {
        currentPayment.value = data.payment
      } else {
        error.value = 'Payment not found'
      }
    } catch (err) {
      console.error('Error fetching payment details:', err)
      error.value = 'Unable to fetch payment details. Please try again later.'
      currentPayment.value = null
    } finally {
      loading.value = false
    }
  }

  // Initialize payment detail from route if available
  const initPaymentDetail = () => {
    if (route.params.reference) {
      fetchPaymentDetail(route.params.reference.toString())
    }
  }

  return {
    // State
    payments,
    currentPayment,
    loading,
    error,
    hasMore,

    // Fetch functions
    fetchPayments,
    fetchPaymentDetail,
    initPaymentDetail,

    // Helper functions
    getStatusColor,
    getStatusIcon,
    getPaymentTypeTitle,
    getRecipientTitle,
    formatStatus,
    projectPaymentTypes,
  }
}
