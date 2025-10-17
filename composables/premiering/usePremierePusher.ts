// composables/usePremierePusher.ts
import { ref, onUnmounted } from 'vue'
import type { Channel } from 'pusher-js'

interface PremiereStatus {
  type: 'upcoming' | 'live' | 'ended'
  label: string
  time_remaining: number
  start_date?: string
  end_date?: string
  ended_at?: string
}

interface ReminderDeletedData {
  reminder_id: number
}

export function usePremierePusher(projectId: number) {
  const { subscribeTo, unsubscribeFrom } = usePusher()

  // Refs to store channels
  const premiereChannel = ref<Channel | null>(null)
  const userChannel = ref<Channel | null>(null)

  // Refs to store latest data
  const currentStatus = ref<PremiereStatus | null>(null)

  // Subscribe to premiere channel
  const subscribeToPremiereUpdates = () => {
    premiereChannel.value = subscribeTo(`premiere.${projectId}`)

    premiereChannel.value?.bind(
      'premiere.status.updated',
      (data: { project_id: number; status: PremiereStatus }) => {
        if (data.project_id === projectId) {
          currentStatus.value = data.status
        }
      }
    )
  }

  // Subscribe to user's private channel for reminders
  const subscribeToReminderUpdates = (userId: number) => {
    userChannel.value = subscribeTo(`private-user.${userId}`)

    userChannel.value?.bind(
      'premiere.reminder.deleted',
      (data: ReminderDeletedData) => {
        // Emit event or update state management store
        const event = new CustomEvent('reminder-deleted', {
          detail: data.reminder_id,
        })
        window.dispatchEvent(event)
      }
    )
  }

  // Method to manually check premiere status
  const checkPremiereStatus = async () => {
    try {
      const { $axios } = useNuxtApp()
      const response = await $axios.get(`/api/premieres/${projectId}/status`)
      currentStatus.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching premiere status:', error)
      return null
    }
  }

  // Initialize subscriptions
  const initialize = (userId?: number) => {
    subscribeToPremiereUpdates()
    if (userId) {
      subscribeToReminderUpdates(userId)
    }
    checkPremiereStatus() // Initial status check
  }

  // Cleanup
  onUnmounted(() => {
    if (premiereChannel.value) {
      unsubscribeFrom(`premiere.${projectId}`)
    }
    if (userChannel.value) {
      const user = useAuthStore().user // Assuming you have an auth store
      if (user) {
        unsubscribeFrom(`private-user.${user.id}`)
      }
    }
  })

  return {
    currentStatus,
    initialize,
    checkPremiereStatus,
  }
}
