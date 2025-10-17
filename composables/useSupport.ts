// composables/useSupport.ts
import { ref, computed } from 'vue'

interface SupportTicket {
  uuid: string
  subject: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  last_message_at: string
  created_at: string
  help_category: {
    id: number
    name: string
  }
  help_sub_category?: {
    id: number
    name: string
  }
  unread_count?: number
}

export const useSupport = () => {
  const { $axios } = useNuxtApp()

  const tickets = ref<SupportTicket[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUserTickets = async (params = {}) => {
    loading.value = true
    try {
      const response = await $axios.get('/api/support/tickets', { params })
      tickets.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch tickets'
    } finally {
      loading.value = false
    }
  }

  // Computed properties for filtering
  const openTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'open')
  )

  const pendingTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'pending')
  )

  const resolvedTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'resolved')
  )

  const closedTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'closed')
  )

  return {
    tickets,
    loading,
    error,
    fetchUserTickets,
    openTickets,
    pendingTickets,
    resolvedTickets,
    closedTickets,
  }
}
