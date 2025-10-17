// stores/useUpcomingStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Premiere {
  id: number
  access_uuid: string
  name: string
  thumbnail_url: string
  premiering_start_date: string
  premiering_time: string
  time_zone: string
  is_notified: boolean
  creator?: {
    name: string
    avatar_url: string
  }
}

export const useUpcomingStore = defineStore('upcoming', () => {
  const premieres = ref<Premiere[]>([])
  const notifiedPremieres = ref<Premiere[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const toggleNotification = async (premiereId: number) => {
    const { $axios } = useNuxtApp()

    try {
      const { data } = await $axios.post(
        `/api/upcoming/premieres/${premiereId}/notify`
      )

      // Update the premiere in both lists
      const updatePremiere = (list: Premiere[]) => {
        const index = list.findIndex((p) => p.id === premiereId)
        if (index !== -1) {
          list[index] = {
            ...list[index],
            is_notified: data.data.is_notified,
          }
        }
      }

      updatePremiere(premieres.value)
      updatePremiere(notifiedPremieres.value)

      // If notification was removed, remove from notified list
      if (!data.data.is_notified) {
        notifiedPremieres.value = notifiedPremieres.value.filter(
          (p) => p.id !== premiereId
        )
      }

      return data.data
    } catch (error) {
      console.error('Error toggling notification:', error)
      throw error
    }
  }

  const fetchPremieres = async (page: number = 1, perPage: number = 12) => {
    isLoading.value = true
    error.value = null
    const { $axios } = useNuxtApp()

    try {
      const { data } = await $axios.get('/api/upcoming/premieres', {
        params: { page, per_page: perPage },
      })
      premieres.value = data.data
      return data
    } catch (err) {
      error.value = 'Failed to fetch premieres'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchNotifiedPremieres = async (
    page: number = 1,
    perPage: number = 12
  ) => {
    isLoading.value = true
    error.value = null
    const { $axios } = useNuxtApp()

    try {
      const { data } = await $axios.get('/api/upcoming/premieres/notified', {
        params: { page, per_page: perPage },
      })
      notifiedPremieres.value = data.data
      return data
    } catch (err) {
      error.value = 'Failed to fetch notified premieres'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    premieres,
    notifiedPremieres,
    isLoading,
    error,
    toggleNotification,
    fetchPremieres,
    fetchNotifiedPremieres,
  }
})
