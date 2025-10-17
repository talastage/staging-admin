// composables/usePremiereReminders.ts
import { ref } from 'vue'
import type { Premiere } from '~/types/premiere'

export function usePremiereReminders() {
  const { $axios, $protectedAction } = useNuxtApp()

  // State
  const reminderLoading = ref<number | null>(null)
  const reminders = ref<number[]>([])
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success' as 'success' | 'error' | 'warning',
  })

  // Methods
  const hasReminder = (premiereId: number): boolean => {
    return reminders.value.includes(premiereId)
  }

  const showSnackbar = (
    text: string,
    color: 'success' | 'error' | 'warning' = 'success'
  ) => {
    snackbar.value = {
      show: true,
      text,
      color,
    }
  }

  const handleReminderToggle = async (premiere: Premiere) => {
    await $protectedAction(
      async () => {
        reminderLoading.value = premiere.id

        try {
          if (hasReminder(premiere.id)) {
            const response = await $axios.get('/api/premiering/reminders')
            const reminder = response.data.find(
              (r: any) => r.project_id === premiere.id
            )

            if (reminder) {
              await $axios.delete(`/api/premiering/reminders/${reminder.id}`)
              reminders.value = reminders.value.filter(
                (id) => id !== premiere.id
              )
              showSnackbar('Reminder removed')
            }
          } else {
            const premiereDate = new Date(premiere.premiere_start_date)
            const reminderTime = new Date(premiereDate.getTime() - 15 * 60000)

            await $axios.post(
              `/api/premiering/reminders/${premiere.id}/reminders`,
              {
                reminder_time: reminderTime.toISOString(),
              }
            )

            reminders.value.push(premiere.id)
            showSnackbar('Reminder set successfully')
          }
        } finally {
          reminderLoading.value = null
        }
      },
      {
        onError: (error) => {
          console.error('Error toggling reminder:', error)
          showSnackbar('Failed to update reminder', 'error')
        },
      }
    )
  }

  const fetchReminders = async () => {
    try {
      const response = await $axios.get('/api/premiering/reminders')
      reminders.value = response.data.map(
        (reminder: any) => reminder.project_id
      )
    } catch (err) {
      console.error('Error fetching reminders:', err)
    }
  }

  // Real-time updates setup
  const setupRealtimeUpdates = () => {
    const { subscribeTo, unsubscribeFrom } = usePusher()

    const channel = subscribeTo('premieres')
    channel?.bind('reminder.updated', () => {
      fetchReminders()
    })

    onUnmounted(() => {
      unsubscribeFrom('premieres')
    })
  }

  // Initialize
  onMounted(() => {
    fetchReminders()
    setupRealtimeUpdates()
  })

  return {
    reminderLoading,
    reminders,
    snackbar,
    hasReminder,
    handleReminderToggle,
    fetchReminders,
  }
}
