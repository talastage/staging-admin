import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'
import type { WatchProject, WatchResponse } from '@/types/watch'
import { useUpcomingPremiereNotificationStore } from '@/stores/useUpcomingPremiereNotificationStore'

// Store types
type Project = WatchProject

interface UseWatchProjectStore {
  project: WatchProject | null
  error: Error | null
  isLoading: boolean
  fetchProject(uuid: string, timezone?: string): Promise<void>
  clearError(): void
  reset(): void
}

export const useWatchProjectStore = defineStore('watchProject', () => {
  // State
  const project = ref<WatchProject | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  // Computed
  const isVideoReady = computed(
    () =>
      project.value?.status === 'published' && project.value?.video_url != null
  )

  const videoUrl = computed(() => project.value?.video_url || '')

  const isPremiere = computed(() => {
    return Boolean(project.value?.premiering?.is_future)
  })

  const premiereInfo = computed(() => project.value?.premiering || null)

  // Get Nuxt's axios instance
  const { $axios } = useNuxtApp()

  const fetchProject = async (
    accessUuid: string,
    tz?: string
  ): Promise<void> => {
    if (!accessUuid) {
      throw new Error('Access UUID is required')
    }

    isLoading.value = true
    error.value = null

    try {
      const { data: response } = await $axios.get<WatchResponse>(
        `/api/projects/${accessUuid}/watch`,
        {
          params: {
            timezone: tz || undefined,
          },
        }
      )

      if (response.status === 'success' && response.data) {
        project.value = {
          ...response.data,
        }
        // Sync notification state: if API returns is_notified as true, update the notification store.
        if (project.value.is_notified) {
          const notificationStore = useUpcomingPremiereNotificationStore()
          notificationStore.setNotificationStatus(project.value.id, true)
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : 'An error occurred while fetching the project'

      error.value = new Error(errorMessage)
      project.value = null

      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // Helper methods
  const clearError = (): void => {
    error.value = null
  }

  const reset = (): void => {
    project.value = null
    error.value = null
    isLoading.value = false
  }

  // Getters
  const getProjectStatus = computed(() => project.value?.status || null)
  const getProjectType = computed(() => project.value?.type || null)

  return {
    // State
    project,
    error,
    isLoading,

    // Computed
    isVideoReady,
    videoUrl,
    projectStatus: getProjectStatus,
    projectType: getProjectType,
    isPremiere,
    premiereInfo,

    // Actions
    fetchProject,
    clearError,
    reset,
  }
})
