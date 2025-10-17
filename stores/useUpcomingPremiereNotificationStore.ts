// stores/useUpcomingPremiereNotificationStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import type { WatchProject, WatchResponse } from '@/types/watch'

interface UpcomingPremiereNotificationState {
  notifiedPremiereIds: Set<number>
  loadingStates: Map<number, boolean>
}

interface NotificationResponse {
  status: string
  data: {
    is_notified: boolean
  }
}

export const useUpcomingPremiereNotificationStore = defineStore(
  'upcomingPremiereNotifications',
  () => {
    // Maintain existing state structure
    const notifiedPremiereIds = ref<Set<number>>(new Set())
    const loadingStates = ref<Map<number, boolean>>(new Map())
    const shouldRefreshNotified = ref(false)

    // Existing methods - kept for backward compatibility
    const isNotified = (premiereId: number): boolean => {
      return notifiedPremiereIds.value.has(premiereId)
    }

    const setNotificationStatus = (premiereId: number, status: boolean) => {
      if (status) {
        notifiedPremiereIds.value.add(premiereId)
      } else {
        notifiedPremiereIds.value.delete(premiereId)
      }
      shouldRefreshNotified.value = true
    }

    const setLoadingState = (premiereId: number, isLoading: boolean) => {
      if (isLoading) {
        loadingStates.value.set(premiereId, true)
      } else {
        loadingStates.value.delete(premiereId)
      }
    }

    const isLoading = (premiereId: number): boolean => {
      return loadingStates.value.has(premiereId)
    }

    // Updated toggle notification method with better error handling
    const toggleNotification = async (project: WatchProject) => {
      if (isLoading(project.id)) return

      setLoadingState(project.id, true)
      try {
        const { $axios } = useNuxtApp()
        const { data } = await $axios.post(
          `/api/upcoming/premieres/${project.access_uuid}/notify`
        )

        setNotificationStatus(project.id, data.data.is_notified)
        return data.data
      } catch (error) {
        console.error('Error toggling upcoming premiere notification:', error)
        throw error
      } finally {
        setLoadingState(project.id, false)
      }
    }

    const resetRefreshFlag = () => {
      shouldRefreshNotified.value = false
    }

    // New method for bulk updating notification statuses
    const initializeNotifications = (notifiedIds: number[]) => {
      notifiedPremiereIds.value = new Set(notifiedIds)
    }

    return {
      // Existing exports
      isNotified,
      isLoading,
      toggleNotification,
      setNotificationStatus,
      shouldRefreshNotified,
      resetRefreshFlag,
      // New exports
      initializeNotifications,
    }
  }
)
