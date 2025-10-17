import { defineNuxtPlugin } from '#app'
import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUpcomingPremiereNotificationStore } from '~/stores/useUpcomingPremiereNotificationStore'

export default defineNuxtPlugin(() => {
  // Reset store on user logout
  watch(
    () => useAuthStore().isLoggedIn,
    (isLoggedIn) => {
      if (!isLoggedIn) {
        const notificationStore = useUpcomingPremiereNotificationStore()
        // Since clearNotifications doesn't exist, we'll initialize with empty array
        notificationStore.initializeNotifications([])
      }
    }
  )
})