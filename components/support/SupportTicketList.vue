<!-- components/support/SupportTicketList.vue -->
<template>
  <div class="support-ticket-list">
    <v-card>
      <v-list v-if="items.length">
        <v-list-item
          v-for="ticket in items"
          :key="ticket.uuid"
          :to="`/support/ticket/${ticket.uuid}`"
          :class="{ 'has-unread': ticket.unread_count }"
          color="primary"
        >
          <template v-slot:prepend>
            <v-badge
              :color="getStatusColor(ticket.status)"
              dot
              location="bottom end"
              offset-x="2"
              offset-y="2"
            />
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ ticket.subject }}
          </v-list-item-title>

          <v-list-item-subtitle class="mt-1">
            <v-chip
              size="x-small"
              class="mr-2"
              :color="getStatusColor(ticket.status)"
              variant="tonal"
            >
              {{ ticket.status }}
            </v-chip>
            {{ ticket.help_category.name }}
            {{
              ticket.help_sub_category
                ? `• ${ticket.help_sub_category.name}`
                : ''
            }}
            • {{ formatDate(ticket.last_message_at || ticket.created_at) }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-badge
              v-if="ticket.unread_count"
              :content="ticket.unread_count"
              color="primary"
            />
          </template>
        </v-list-item>

        <!-- Loading indicator for infinite scroll -->
        <div v-if="isLoading" class="pa-4 d-flex justify-center">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- End of list indicator -->
        <div
          v-if="!hasMore && items.length"
          class="pa-4 text-center text-caption"
        >
          No more tickets to load
        </div>
      </v-list>

      <!-- Empty state -->
      <v-card-text v-else-if="!isLoading">
        <v-alert type="info" variant="tonal" class="mt-4">
          No support tickets found.
        </v-alert>
      </v-card-text>

      <!-- Initial loading state -->
      <v-card-text v-else>
        <div class="d-flex justify-center pa-4">
          <v-progress-circular indeterminate />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

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

const { $axios } = useNuxtApp()

// Fetch function for infinite scroll
const fetchTickets = async (page: number): Promise<SupportTicket[]> => {
  try {
    const response = await $axios.get('/api/support/tickets', {
      params: {
        page,
        per_page: 15, // Adjust per_page as needed
      },
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching tickets:', error)
    throw error
  }
}

// Initialize infinite scroll
const { items, isLoading, error, hasMore } = useInfiniteScroll<SupportTicket>(
  fetchTickets,
  {
    threshold: 200,
    throttle: 300,
  }
)

// Status color mapping
const getStatusColor = (status: string) => {
  const colors = {
    open: 'primary',
    pending: 'warning',
    resolved: 'success',
    closed: 'grey',
  }
  return colors[status] || 'grey'
}

// Date formatter
const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return (
      'Today ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return d.toLocaleDateString([], { weekday: 'long' })
  } else {
    return d.toLocaleDateString()
  }
}

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    // Handle error (e.g., show toast notification)
    console.error('Error in infinite scroll:', newError)
  }
})
</script>

<style scoped>
.support-ticket-list {
  min-height: 200px;
}

.has-unread {
  background-color: rgb(var(--v-theme-primary), 0.1);
}

.v-list-item {
  margin-bottom: 4px;
  border-radius: 8px;
}

/* Smooth loading transition */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
